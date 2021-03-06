import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import firebase from 'firebase';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { EditarPerfilPage } from '../editar-perfil/editar-perfil';
import { LoginPage } from '../login/login';
import { FCM } from '@ionic-native/fcm';
import { AdvogadoPerfilPage } from '../advogado-perfil/advogado-perfil';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  
  image: string;   
  avatar: string;
  displayName: string;
  usuario: any = "";
  name: string;
  telefone: string;
  uid: string;
  usuarios:any;
  duvidas: any [] = [];   
  userId: string;
  id:any = []
  
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,  
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private fcm: FCM){
      
      this.userId = firebase.auth().currentUser.uid
      let refe = firebase.database().ref('advogado').child(this.userId);
      refe.once('value', ((docs) => { 
        docs.forEach((doc) => {
          this.id.push(doc.val())
        })
        console.log(this.id)
        if(docs.val() !== null){
          this.navCtrl.setRoot('AdvogadoPerfilPage')
        }else{
          // this.fcm.getToken().then(token => {
          //   firebase.database().ref('usuario').child(this.userId).child('device_token').set(token);
          // })
          this.usuarioDados();
          this.getDuvidas();
        }
      }))
    }
    
    usuarioDados = () => {
      this.usuarios= [];
      this.uid = firebase.auth().currentUser.uid;
      console.log(this.uid);
      firebase.database().ref("usuario/" + this.uid).once('value')
      .then((docs) => {
        this.usuarios.push(docs.val())
      })
    }
    
    getDuvidas(){
      this.duvidas = [];
      let loading =  this.loadingCtrl.create({
        content:"Carregando as suas perguntas"
      })
      loading.present()
      firebase.database().ref('duvida/'+this.uid).limitToLast(5).once('value', (snapshot) => {
        snapshot.forEach((doc) => {
          this.duvidas.push(doc.val())
          this.duvidas = this.duvidas.slice(0).reverse()
          console.log(this.duvidas.length)
        })
        loading.dismiss();
      }).then((doc) => {
        firebase.database().ref('usuario/'+this.uid).limitToLast(5).once('value', (docs) => {
          docs.forEach((doc) => {
            console.log(doc.val())
          })
        })
        console.log(doc.val())

      }).catch((error) => {
        console.log(error)
      })
    }
    
    chatComment(duvida){
      this.navCtrl.push('ChatPage', {"duvida":duvida })
    }
    
    editarPerfil(){
      this.navCtrl.push(EditarPerfilPage);
    }
    
    sair(){
      firebase.auth().signOut().then(() =>{
        let toast = this.toastCtrl.create({
          message:"Você foi deslogado com sucesso",
          duration: 3000
        }).present()
        
        this.navCtrl.setRoot(LoginPage);
      });
    }
    
  }
  