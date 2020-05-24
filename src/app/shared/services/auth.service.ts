import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { User } from '../models/user';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any;


  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public ngZone: NgZone,
    public router: Router
  ) {
    /**
     * Guardamos los datos en localstorage al iniciar sesion, se eliminan al cerrar sesion
     */

  }

  signUp(user: User, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(user.email, password)
      .then(result => {
        result.user.updateProfile({
          displayName: user.displayName,
          photoURL: user.photoURL
        })
        let userTemp = { ...user }
        userTemp.uid = result.user.uid
        // this.sendVerificationEmail();
        this.updateLocalStorage(userTemp);
        this.ngZone.run(() => {
          this.router.navigate(['producer/profile']);
        });
        this.setUserData(userTemp);
      })
      .catch(err => console.error(err))
  }

  signIn(email: string, password: string) {
    try {
      return this.afAuth.signInWithEmailAndPassword(email, password)
        .then(resp => {
          return resp
        });
    }
    catch (error) {
      window.alert(error.message);
    }
  }


  isAuth() {
    return this.afAuth.user;
  }

  sendVerificationEmail() {
    return this.afAuth.currentUser
      .then(res => {
        res.sendEmailVerification()
      })
  }

  // setUserData(user: any, role: string) { Si tenemos en cuenta el rol
  setUserData(user: User) {

    let temp: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      favorite_streamings: user.favorite_streamings
    }

    // console.log('temp:', temp)
    // return this.afs.collection(role).add(temp); Si tenemos en cuenta el rol
    return this.afs.collection('user').doc(temp.uid).set(temp);
  }

  signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['home']);
    })
  }

  getUser(user_id){
    return this.afs.collection('user', query => query.where('uid', '==', user_id)).valueChanges();
  }

  updateLocalStorage(user) {

    const temp: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      favorite_streamings: user.favorite_streamings,
      preferences: user.preferences
    }

    localStorage.setItem('user', JSON.stringify(temp));
  }
  updateLocalStorage2(user_id) {
    return new Promise((resolve, rejected) => {
      this.afs.collection('user').doc(user_id).valueChanges()
        .subscribe(result_1 => {
          let res = JSON.parse(JSON.stringify(result_1));
          console.log(res);
          const user: User = {
            uid: res.uid,
            email: res.email,
            displayName: res.displayName,
            photoURL: res.photoURL,
            emailVerified: res.emailVerified,
            favorite_streamings: res.favorite_streamings,
            preferences: res.preferences
          };
          localStorage.setItem('user', JSON.stringify(user));
          resolve();
        })
    });

  }

  updateFavoritesLocalStorage(id_user) {
    var res = this.afs.collection("user").doc(id_user).valueChanges()
      .subscribe(res => {
        this.updateLocalStorage(res);
      })

  }

  updateDatabaseUser(userId,user_name) {
    this.updateLocalStorage2(userId);
    var docRef = this.afs.collection("user").doc(userId);

    return docRef.update({
      displayName: user_name
    })
      .then(() => {
        console.log("Document successfully updated!");
        this.ngZone.run(() => {
          this.router.navigate(['producer/profile']);
        });
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }



}
