import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from "rxjs/operators";
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  @Output()
  cerrarVentana = new EventEmitter<string>();

  @Output()
  changeView = new EventEmitter<Boolean>();

  @ViewChild('imageUser') inputImageUser: ElementRef;

  options = [
    { value: 'producer', viewValue: 'Producer' },
    { value: 'viewer', viewValue: 'Viewer' }
  ]


  dataUser: FormGroup;
  upLoadPercent: Observable<number>;
  urlImage: Observable<string>;


  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private storage: AngularFireStorage,
    private toastService: ToastrService

  ) {
    this.buildForm();
  }


  ngOnInit(): void {
  }

  signUp(event: Event) {
    event.preventDefault();
    const user: User = {
      uid: '',
      email: this.dataUser.value.email,
      displayName: this.dataUser.value.name,
      photoURL: this.inputImageUser.nativeElement.value,
      emailVerified: false,
      favorite_streamings: []
    }
    this.auth.signUp(user, this.dataUser.value.password)
      .then((res) => {
        this.toastService.success("Tu registro ha sido correcto")
        this.cerrarVentana.emit("cerrar");
      })
      .catch(err => {
        this.toastService.error("Registro incorrecto")
        console.error(err)
      })
  }

  changeBool() {
    this.changeView.emit(true);
  }

  onUpload(e) {
    const id = Math.random().toString(36).substring(2);
    const file = e.target.files[0];
    const filePhat = `profile/${id}`;
    const ref = this.storage.ref(filePhat);
    const task = this.storage.upload(filePhat, file);
    this.upLoadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(finalize(() => this.urlImage = ref.getDownloadURL()))
      .subscribe();
  }

  private buildForm() {
    this.dataUser = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      // role: ['', [Validators.required]] Sin role
    })
  }

}
