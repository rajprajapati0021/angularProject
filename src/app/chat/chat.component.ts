import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialog
} from '@angular/material/dialog';
import * as SignalR from '@microsoft/signalr';
import { SignUpFormData } from '../login/sign-up-form-data';
import { Message } from '../models/message';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { LoginService } from '../services/login.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewInit {

  token : string = "";
  users : SignUpFormData[] = [];
  selectedUserName! : string;
  selectedUserId = "0";
  message = null;
  connection!: SignalR.HubConnection;
  senderUserCard! : HTMLDivElement;
  messages : Message[] = [];
  messageObj! : Message;
  file! : File | null;
  isBadgeShow : Boolean = false;
  currentUser : any;
  currentUserNumber! : Number 
  messageFormData = new FormData();
  filePreview: string | ArrayBuffer | null = null;
  activeUserIds : bigint[] = [];
  audioModel : boolean = false;
  videoModel : boolean = false;
  isCallPick : boolean = false;
  isGreenBtn : boolean = false;
  private callPickResolver!: (value: boolean) => void;

  readonly dialog = inject(MatDialog);
  iceServersConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  localStream = new MediaStream();
  peerConnection : RTCPeerConnection | null = null;

  @ViewChild('iconBox') iconElement! : ElementRef; 
  @ViewChild('localAudio') localAudio! : ElementRef<HTMLAudioElement>;
  @ViewChild('remoteAudio') remoteAudio! : ElementRef<HTMLAudioElement>;
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('chat') chatContainer! : ElementRef;
  


  constructor(private loginService : LoginService, private authService : AuthService, private chatService : ChatService, private cdr: ChangeDetectorRef){
    this.token = localStorage.getItem("token") ?? "";

    this.currentUser = authService.userClaims();
    this.currentUserNumber = Number(this.currentUser.id)
    loginService.getUserDetail(null,null).subscribe({
      next : (data) =>{
        this.users = data.filter(x => x.id != this.currentUser.id);
        this.currentUser = data.find( x => x.id == this.currentUser.id);
        this.selectedUserName = data.length == 0 ? "John Weird" : `${this.users[0].firstName} ${this.users[0].lastName}`
        this.selectedUserId =  data.length == 0 ? "0" : `${this.users[0].id}`
        this.chatService.getMessages(Number(this.selectedUserId)).subscribe((oldMessages) => {
          this.messages = oldMessages;
          this.scrollToBottom();
        })
      },
      error: () => {
        console.log("error in getting users details")
      }
    })
  }

 ngAfterViewInit() {

  }

  ngOnInit() {
    this.initializeSignalRConnection();
    this.senderUserCard = document.getElementById(this.selectedUserId) as HTMLDivElement;
  }

   initializeSignalRConnection() {
    this.connection = new SignalR.HubConnectionBuilder()
      .withUrl('http://192.168.0.221:5269/api/chatHub',{
        accessTokenFactory: () => localStorage.getItem("token") || ""  // ✅ Send JWT token 
      })
      .withAutomaticReconnect() // ✅ Ensures it reconnects after disconnect
      .build();

    this.connection.start()
      .then(async () => {  // ✅ Make it async
          console.log("SignalR Connected!");
          await this.setupSignalRListeners();  // ✅ Await it since it contains async code
          await this.connection.invoke("SendActiveUserIds");  // ✅ Ensure it runs after listeners are set
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    // ✅ Handle reconnection events
    this.connection.onreconnected(() => {
      console.log("Reconnected to SignalR hub!");
      this.setupSignalRListeners(); // ✅ Reattach listeners after reconnection
    });
  }


  async setupSignalRListeners() {
    this.connection.on('ReceiveMessage', async (messageObj: Message, senderUserId: any) => {
        console.log(`Message received: ${messageObj.text}`);
        if (senderUserId === this.selectedUserId) {
            this.messages.push(messageObj);
            this.scrollToBottom();
        } else {
            this.senderUserCard = document.getElementById(senderUserId) as HTMLDivElement;
            if (this.senderUserCard) {
                this.senderUserCard.innerHTML += `
                    <span>
                        <i class="ri-mail-unread-line" style="color:rgb(144, 235, 9); font-size: large;"></i>
                    </span>
                `;
            }
        }
    });

    this.connection.on("ReceiveActiveUserIds", (activeUserIds: bigint[]) => {
        console.log(activeUserIds);
        this.activeUserIds = activeUserIds;
    });

    this.connection.on("ReceiveSignal", async (fromUserId: string, signal: string, isVideoChat: boolean) => {
        console.log("Signal received from:", fromUserId);
        const signalData = JSON.parse(signal);

        if (signalData?.sdp?.type === "offer") {
            this.videoModel = true;
            this.cdr.detectChanges();
            console.log("ViewChild elements initialized. Reciever side",this.remoteVideo,this.localVideo);
        }

        if (signalData.sdp) {
            if (this.peerConnection == null) await this.setupPeerConnection(true); // ✅ Await to ensure setup is complete

            await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(signalData.sdp));

            if (signalData.sdp.type === "offer") {
                console.log("Received offer, sending answer...");
                isVideoChat ? (this.videoModel = true) : (this.audioModel = true);
                this.isGreenBtn = true;

                const userResponse = await this.callPickPromise(); // Waits for user action

                if (!userResponse) {
                    console.log("Call declined.");
                    this.endVideoChat();
                    return;
                }

                await (isVideoChat ? this.startLocalVideoStream() : this.startLocalStream());

                this.localStream.getTracks().forEach((track) => {
                    this.peerConnection?.addTrack(track, this.localStream);
                });

                const answer = await this.peerConnection?.createAnswer();
                await this.peerConnection?.setLocalDescription(answer);

                console.log("Sending answer to:", fromUserId);
                await this.connection.invoke("SendSignal", fromUserId, JSON.stringify({ sdp: answer }), true);
                this.isGreenBtn = true;
            }
        } else if (signalData.ice) {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(signalData.ice));
                console.log("Added ICE candidate.");
            }
        }
    });
}

 callPickPromise(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    this.callPickResolver = resolve; // Store the resolve function
  });
}

  userSelected(user : SignUpFormData){

    this.selectedUserName = `${user.firstName} ${user.lastName}`;
    this.selectedUserId = user.id.toString();
    this.senderUserCard = document.getElementById(this.selectedUserId) as HTMLDivElement;
    var isTrue = this.senderUserCard.innerHTML.includes(`ri-mail-unread-line`)
    if(isTrue){
      let spans = this.senderUserCard.querySelectorAll('span');
      this.senderUserCard.removeChild(spans[spans.length - 1]);
    }
    this.messages = [];
    this.chatService.getMessages(Number(this.selectedUserId)).subscribe((oldMessages) => {
      this.messages = oldMessages;
      this.scrollToBottom();
    })
    console.log("working");
  }

  send(){
    console.log(this.message)
    this.sendMessageToUser();
  }

  sendMessageToUser() {
    let userIdLong = Number(this.selectedUserId);
    if(this.message != null && this.message != ""){

      this.messageObj = {
        id: 0,
        type: "repaly",
        text: this.message!,
        fileUrl : null,
        fileName : null,
        time: this.formatTime(new Date()),
        senderId : Number(this.currentUser.id),
        recieverId : userIdLong,
        userId : null
      };

      Object.entries(this.messageObj).forEach(([key,value]) => {
        if(value != null){
          this.messageFormData.append(key,value.toString())
        }
      })

      if(this.file != undefined && this.file != null){
        this.messageFormData.append("file",this.file)
      }

      this.chatService.addUpdateMessage(this.messageFormData).subscribe({
        next : (response) => {
          var otherUserMessageResponse = {...response};
          otherUserMessageResponse.type = "sender"
          this.connection.invoke("SendMessageToUser", userIdLong, otherUserMessageResponse)
          .then(res => {
            this.messages.push(response);
            this.scrollToBottom();
            this.message = null;
            this.file = null;
            this.filePreview = null;
            this.messageFormData = new FormData();
          })
          .catch(err => console.error("Error sending message: ", err));

        },
        error : (err) => {
          console.log(err)
        }
      })

    }
    else{
      console.log('message is empty')
    }
  }
  
  ngOnDestroy(): void {
    if (this.connection) {
      this.connection.stop().then(() => console.log("SignalR Disconnected"));
    }
  }


  formatTime(date : any) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
    minutes = minutes.toString().padStart(2, '0'); // Ensure two-digit minutes
  
    return `${hours}:${minutes} ${ampm}`;
  }

  scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight ;
      }, 100);
    }
  }

  selectFile(event: Event): void {
    let fileElement = event.target as HTMLInputElement;
    if (fileElement.files && fileElement.files[0]) {
      this.file = fileElement.files[0];
  
      const fileType = this.file.type;
  
      if (fileType.startsWith("image/")) {
        // Image preview
        const reader = new FileReader();
        reader.onload = () => {
          this.filePreview = reader.result; // Base64 image preview
        };
        reader.readAsDataURL(this.file);
      } else if (fileType.startsWith("video/")) {
        // Video preview (use object URL)
        this.filePreview = URL.createObjectURL(this.file);
      } else if (
        fileType === "application/pdf" ||
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // PDF and DOCX preview (iframe or object URL)
        this.filePreview = URL.createObjectURL(this.file);
      }
    }
  }
  
  removeImage() : void {
    this.file = null;
    this.filePreview = null;
  }

  HangUp(isVideoChat : boolean): void {
    
    if(isVideoChat){
      this.endVideoChat();
      this.callPickResolver(false);
      this.connection.invoke("OnCutCall",this.selectedUserId,true)
      this.videoModel = false;
    }
    else{
      this.endAudieoChat();
      this.connection.invoke("OnCutCall",this.selectedUserId,false)
      this.audioModel = false;
    }
    
    this.isCallPick = false;
  }

  async PickUp(): Promise<boolean> {
    debugger;
    console.log("pick up");
    // this.iconElement.nativeElement.style.backgroundImage = 'url("https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png")';
    // this.iconElement.nativeElement.style.animation = "none";
    this.isCallPick = true;
    this.isGreenBtn = false;
    debugger;
    this.callPickResolver(true);
    // if (this.callPickResolver) {
    //   debugger;
    //   this.callPickResolver(true); // Resolve with "true" when the green button is clicked
    //   // this.callPickResolver = undefined; // Reset resolver
    // }
    return true;
  }

  async startLocalStream() : Promise<void> {
    try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localAudio.nativeElement.srcObject = this.localStream;
        console.log("Local stream started.");
    } catch (error) {
        console.error("Error starting local stream:", error);
    }
  }



//   setupPeerConnection(isVideoChat: boolean) {  
//     debugger;
//     this.peerConnection = new RTCPeerConnection(this.iceServersConfig);

//     this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//       if (event.candidate) {
//           console.log("Sending ICE candidate to:", this.selectedUserId);
  
//           // Ensure `connection.invoke` is correctly typed and exists
//           if (this.connection && this.selectedUserId) {
//               this.connection.invoke("SendSignal", this.selectedUserId, JSON.stringify({ ice: event.candidate }), true)
//                   .catch((error) => console.error("Error sending ICE candidate:", error));
//           } else {
//               console.warn("Connection or selectedUserId is undefined.");
//           }
//       }
//   };

//     this.peerConnection.ontrack = (event) => {
//         console.log("Remote track received.");
//         debugger;
//         if (isVideoChat) {
//             this.remoteVideo.nativeElement.srcObject = event.streams[0];
//         } 
//         else {
//             this.remoteAudio.nativeElement.srcObject = event.streams[0];
//         }
//     };

//     console.log("Peer connection initialized.");
// }



  async startAudioChat() {
    try {
        this.isCallPick = false;
        this.isGreenBtn = false;
        await this.startLocalStream(); // set local src
        // await this.setupPeerConnection(false); // exchange ice  and set remote src
        // Add Local Tracks
        this.localStream.getTracks().forEach((track) => this.peerConnection?.addTrack(track, this.localStream));


        // Create and Send Offer
        const offer = await this.peerConnection?.createOffer();
        await this.peerConnection?.setLocalDescription(offer);

        console.log("Sending offer to:", this.selectedUserId);
        this.connection.invoke("SendSignal", this.selectedUserId, JSON.stringify({ sdp: offer }), false);

    } catch (error) {
        console.error("Error starting video chat:", error);
    }
  }

  async startLocalVideoStream(): Promise<void> {
    try {
        this.localStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });

        if (!this.localStream) {
            throw new Error("Failed to get local media stream.");
        }

        this.localVideo.nativeElement.srcObject = this.localStream;
        console.log("Local stream started.");
    } catch (error) {
        console.error("Error starting local stream:", error);
    }
}

async setupPeerConnection(isVideoChat: boolean): Promise<void> {
    this.peerConnection = new RTCPeerConnection(this.iceServersConfig);

    this.peerConnection.onicecandidate = async ({ candidate }) => {
        if (candidate) {
            console.log("Sending ICE candidate to:", this.selectedUserId);
            await this.connection.invoke("SendSignal", this.selectedUserId, JSON.stringify({ ice: candidate }), isVideoChat);
        }
    };

    this.peerConnection.ontrack = (event) => {
        console.log("Remote track received.");
        if (event.streams.length > 0) {
            this.remoteVideo.nativeElement.srcObject = event.streams[0];
        }
    };

    console.log("Peer connection initialized.");
}

async startVideoChat(): Promise<void> {
    try {
        this.isCallPick = false;
        this.isGreenBtn = false;

        await this.startLocalVideoStream(); // Set local video stream
        await this.setupPeerConnection(true); // Initialize peer connection

        if (!this.peerConnection || !this.localStream) {
            console.error("Peer connection or local stream is not initialized.");
            return;
        }

        // Add Local Tracks
        this.localStream.getTracks().forEach(track => {
            this.peerConnection!.addTrack(track, this.localStream);
        });

        // Create and Send Offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        console.log("Sending offer to:", this.selectedUserId);
        await this.connection.invoke("SendSignal", this.selectedUserId, JSON.stringify({ sdp: offer }), true);
        
    } catch (error) {
        console.error("Error starting video chat:", error);
    }
}


  openModel(isVideoChat : boolean) : void {
    if(isVideoChat){
      this.videoModel = true;
      this.cdr.detectChanges();
      console.log("ViewChild elements initialized.",this.remoteVideo,this.localVideo);
      this.startVideoChat();
    }
    else{
      this.audioModel = true;
      this.startAudioChat();
    }
  }

  endAudieoChat() {
    if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localAudio.nativeElement.srcObject = null;
        this.localStream = new MediaStream();
    }

    if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = new RTCPeerConnection();
    }

    this.remoteAudio.nativeElement.srcObject = null;
    console.log("Video chat ended.");
}

  endVideoChat() {
  if (this.localVideo) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localVideo.nativeElement.srcObject = null;
      this.localStream = new MediaStream();
  }

  if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = new RTCPeerConnection();
  }

  this.remoteVideo.nativeElement.srcObject = null;
  console.log("Video chat ended.");
}
  
}


