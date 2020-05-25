import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { firestore } from 'firebase/app';
import { Comments } from '../models/comments';
import { StreamingCategory } from '../models/streaming';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  constructor(
    public afs: AngularFirestore,
    public ngZone: NgZone,
    public router: Router,
    private http: HttpClient
  ) { }
  /**
   * Get a stream of the streaming.
   * @param streaming_id - Streaming ID
   */
  getStreamingComments(streaming_id: string) {
    return this.afs.collection('comments', query => query.where('streaming_id', '==', streaming_id)).valueChanges();
  }

  getStreamingInfo(streaming_id: string) {
    return this.afs.collection('streamings', query => query.where('uid', '==', streaming_id)).valueChanges();
  }

  postComment(comment: Comments) {
    return this.afs.collection('comments').add(comment);
  }

  getStreamings(id_producer: string) {
    return this.afs.collection('streamings', query => query.where('id_producer', '==', id_producer)).valueChanges();
  }

  getAllStreamings() {
    return this.afs.collection('streamings', query => query.where('status', '==', true)).valueChanges();
  }
  postStreaming(streaming) {
    return this.afs.collection('streamings').add(streaming)
      .then((resp) => {
        var res = this.afs.collection("streamings").doc(resp.id)
          .update({
            uid: resp.id
          })
        this.ngZone.run(() => {
          this.router.navigate(['producer/list']);
        });
      })
      .catch(err => console.error(err));
  }

  selectFavorite(id_user: string, id_streaming: string) {
    var docRef = this.afs.collection("user").doc(id_user);
    docRef.update({
      favorite_streamings: firestore.FieldValue.arrayUnion(id_streaming)
    })
    var docRef = this.afs.collection("streamings").doc(id_streaming);
    docRef.update({
      likes: firestore.FieldValue.increment(1)
    })
  }

  deleteStreaming(id_streaming: string) {
    this.afs.collection("streamings").doc(id_streaming).delete()
      .then(() => {
        console.log("Documento eliminado")
      })
  }
  /**
   * Get suggested streamings by user category
   * @param category - Streaming category
   */
  getSuggestedStreamings(category: StreamingCategory) {
    return this.afs.collection("streamings", query => query.where("category", "==", category).where("available","==",true)).valueChanges();
  }

  getCommentsAnalysis(comments: any[]){
    const httpOptions = {
      headers : new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
      })
    };
    const body = {
      comments: comments
    }
    return this.http.post(`${environment.URL_FUNCTIONS}/toneAnalyser`,body, httpOptions);
  }

  finishStreaming(streamingId){
    return this.afs.collection('streamings').doc(streamingId).update({
      status: false
    })
  }
  fillDatabase() {
    let data1 = [
      {
        "id": 1,
        "name": "Jerry Maguire",
        "url": "https://npr.org/eu/felis/fusce/posuere/felis/sed/lacus.aspx",
        "photoURL": "http://dummyimage.com/194x181.png/5fa2dd/ffffff",
        "short_description": "Spontaneous rupture of extensor tendons, lower leg",
        "long_description": "Neuroendocrine cell hyperplasia of infancy",
        "date_start": "11/1/2020",
        "category": "Drama|Romance",
        "id_producer": "O3hlcp1OoZZvuf6j8FNJ3PE3SwD2"
      },
      {
        "id": 2,
        "name": "Profit, The",
        "url": "https://latimes.com/praesent/id/massa.jpg",
        "photoURL": "http://dummyimage.com/124x128.png/ff4444/ffffff",
        "short_description": "Cervicalgia",
        "long_description": "Ureteral fistula",
        "date_start": "27/7/2019",
        "category": "Drama",
        "id_producer": "O3hlcp1OoZZvuf6j8FNJ3PE3SwD2"
      },
      {
        "id": 3,
        "name": "Prince of Pennsylvania, The",
        "url": "http://latimes.com/consectetuer/adipiscing/elit/proin/interdum/mauris.aspx",
        "photoURL": "http://dummyimage.com/200x240.png/ff4444/ffffff",
        "short_description": "Unsp pedl cyclst injured in nonclsn trnsp accident nontraf",
        "long_description": "Sector or arcuate visual field defects",
        "date_start": "28/8/2019",
        "category": "Comedy|Drama",
        "id_producer": "O3hlcp1OoZZvuf6j8FNJ3PE3SwD2"
      },
      {
        "id": 4,
        "name": "Bad Sleep Well, The (Warui yatsu hodo yoku nemuru)",
        "url": "https://va.gov/malesuada/in/imperdiet.js",
        "photoURL": "http://dummyimage.com/176x171.png/dddddd/000000",
        "short_description": "Toxic effect of venom of wasps, undetermined, init encntr",
        "long_description": "Other fall",
        "date_start": "1/4/2020",
        "category": "Drama|Thriller",
        "id_producer": "O3hlcp1OoZZvuf6j8FNJ3PE3SwD2"
      }
    ]
    let data2 = [
      {
        "id": 1,
        "name": "Guy Named Joe, A",
        "url": "https://forbes.com/purus/eu/magna/vulputate/luctus.png",
        "photoURL": "http://dummyimage.com/137x204.png/cc0000/ffffff",
        "short_description": "Congenital malformations of great arteries",
        "long_description": "Second-degree perineal laceration, delivered, with or without mention of antepartum condition",
        "date_start": "17/5/2019",
        "category": "Drama|Fantasy|Romance|War",
        "id_producer": "KLWKv39qniOTf2MKPcDLdGRy1wx1"
      },
      {
        "id": 2,
        "name": "Pauline & Paulette (Pauline en Paulette)",
        "url": "http://fc2.com/mattis/odio/donec/vitae.html",
        "photoURL": "http://dummyimage.com/168x156.png/cc0000/ffffff",
        "short_description": "Unsp injury of great saphenous at hip and thi lev, left leg",
        "long_description": "Candidal meningitis",
        "date_start": "21/1/2020",
        "category": "Comedy|Drama",
        "id_producer": "KLWKv39qniOTf2MKPcDLdGRy1wx1"
      },
      {
        "id": 3,
        "name": "Knockout",
        "url": "http://who.int/felis/eu/sapien.json",
        "photoURL": "http://dummyimage.com/190x159.png/ff4444/ffffff",
        "short_description": "Encounter for screening for other disorder",
        "long_description": "Referred otogenic pain",
        "date_start": "7/5/2020",
        "category": "Action|Drama",
        "id_producer": "KLWKv39qniOTf2MKPcDLdGRy1wx1"
      },
      {
        "id": 4,
        "name": "Mask of Dimitrios, The",
        "url": "http://unblog.fr/porta/volutpat/quam/pede.xml",
        "photoURL": "http://dummyimage.com/214x182.png/ff4444/ffffff",
        "short_description": "Left anterior fascicular block",
        "long_description": "Slow transit constipation",
        "date_start": "18/11/2019",
        "category": "Crime|Drama|Film-Noir|Mystery",
        "id_producer": "KLWKv39qniOTf2MKPcDLdGRy1wx1"
      }
    ]
    data2.forEach(element => {
      this.afs.collection('streamings').add(element)
        .catch(err => console.error(err));

    });


  }
}
