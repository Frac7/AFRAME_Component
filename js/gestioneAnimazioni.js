var properties = ['material.opacity', 'material.color', 'position', 'scale', 'rotation'];
var values = [];
var setted = false;
var currentFrame = 0;
//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio) per ora i key frames si generano con un timer;
//un insieme di valori per scegliere quale proprietà manipolare (qui bisogna dare la possibilità all'utente di
//switchare controllo per il transform, magari con una gesture)
//e infine in base alle proprietà i valori da usare

//funzione di prova stringa transform
function stringfy(object) {
    //prova traslazione, scala e rotazione di uno ad ogni frame
    return ((object.x + (Math.random()/10)) + ' ' + (object.y + (Math.random()/10)) + ' ' + (object.z + (Math.random()/10)));
}

function randomValues () {
    while(values.length)
        values.pop();
    let opacity, colors, color;
    opacity = Math.random();
    colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
    color = parseInt(Math.random() * 6);
    //gli attributi del transform vengono gestiti dentro la scena, quindi sarebbe utile gestire lo switch della tipologia di transform
    values.push(opacity, colors[color], stringfy(targetObject.getAttribute('position')), stringfy(targetObject.getAttribute('scale')), stringfy(targetObject.getAttribute('rotation')));
    console.log(values);
}

//viene quindi salvata la posizione e poi vengono assegnate queste proprietà all'animazione
//(supponiamo che non siano state generate random ma che siano state selezionate dall'utente)

//dall'altro script viene recuperato l'array dei valori
//le proprietà dell'oggetto presenti in properties devono essere modificate con i valori presenti in values

//dopo aver creato il key frame, si sposta l'oggetto e si modificano le proprietà, si seleziona un nuovo key frame

//--------------------------------------------------------------------------------------------------------------------//

//problema: deve essere possibile modificare un key frame precedentemente salvato?
//problema 2: al momento l'animazione viene creata sul targetObject, quindi puntando altri elementi si passa direttamente a creare
//un'altra animazione

//per gestire start/stop/resum si emette l'evento con nome corrispondente all'azione

//funzione temporanea
function createKeyFrames (self) {
    //ogni tot viene creato un key frame: crea un key frame ogni 10 secondi, massimo 3 key frames
        let timer = setInterval(function () {
            if(targetObject.keyFrames.length > 3)
                clearInterval(timer);
            else {
                console.log('key frame ' + targetObject.keyFrames.length);
                //questa porzione di codice va integrata con la selezione nel menu:
                //il timer verrà sostituito da un bottone per selezionare il key frame, alla pressione
                //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione

                //genera i valori
                //al posto di questa funzione, si prelevano i valori dalla gui
                randomValues();
                //assegna i valori in base a properties e values, l'oggetto è targetObject
                //(quindi oggetto precedentemente selezionato con il componente intersect-and-manipulate)
                let attributes = [];
                let keyFrame = [];
                for (let i = 0; i < properties.length; i++) {
                    //solo nel caso del primo frame si salva il ritardo, per la durata dipende dal numero di key frames
                    attributes[i] = {
                        property: properties[i],
                        dur: self.data.duration,
                        easing: self.data.interpolation,
                        to: values[i],
                        delay: targetObject.keyFrames.length === 0? self.data.delay: 100, //0.1 secondi
                        loop: self.data.repeat,
                        startEvents: 'start',
                        pauseEvents: 'stop',
                        resumeEvents: 'resume'
                    };
                    //salvataggio key frame (una locazione per ogni proprietà, formano un key frame)
                    keyFrame.push({
                        name: 'animation__' + properties[i],
                        values: attributes[i]
                    });
                }
                //salvataggio singolo key frame (una locazione nell'array dei vari key frames)
                targetObject.keyFrames.push(keyFrame);
            }
            console.log(targetObject.keyFrames);
        }, 10000);
        //prova inizio animazione
        setTimeout(function () {
           animate();
        }, 45000);
}

function animate () {
    if(targetObject.keyFrames.length && targetObject.keyFrames[currentFrame] !== undefined) {
        console.log(targetObject.getAttribute('material').color);
        //assegna il nuovo key frame
        for(let i = 0; i < targetObject.keyFrames[currentFrame].length; i++) {
            //adattamento durata in base al numero dei key frames
            targetObject.keyFrames[currentFrame][i].values.dur /= targetObject.keyFrames.length;
            //assegnamento proprietà
            targetObject.setAttribute(targetObject.keyFrames[currentFrame][i].name, targetObject.keyFrames[currentFrame][i].values);
        }
        //emette l'evento per iniziare l'animazione
        targetObject.emit('start');
        currentFrame++;
        console.log('animazione ' + currentFrame);
    }
}

AFRAME.registerComponent('animate', {
    schema: {
        //per property e interpolation, nella gui, deve essere mostrato un elenco con le opzioni dispnibili
        trajectory: {type: 'string', default: ''},
        property: {type: 'string', oneOf: ['', 'material.color', 'material.opacity', 'rotation', 'scale'], default: ''},
        value: {type: 'string', default: ''},
        //property e value verranno selezionati dalla gui, i valori selezionati devono essere assegnati a questi due valori
        //i quali sostituiranno la funziona che genera valori random
        interpolation: {type: 'string', oneOf: ['linear', 'elastic', 'back'], default: 'linear'},
        repeat: {type: 'string', default: '1'},
        duration: {type: 'float', default: 5000},
        delay: {type: 'float', default: 1000}
    },

    tick: function () {
        if(targetObject !== null) {
            //questa porzione di codice viene eseguita una sola volta
            if(!setted) {
                targetObject.keyFrames = [];
                setted = true;
                //"test" del componente: partenza della prima animazione
                createKeyFrames(this);
                //registrazione event listener sull'oggetto taggato
                //nell'event listener della fine di un'animazione si fa partire la successiva
                targetObject.addEventListener('animationcomplete', function () {
                    console.log('animazione completata');
                    animate();
                });
            }
        }
    }
});
