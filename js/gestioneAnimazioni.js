//per definire i key frames si definisce prima la posizione (quindi la traiettoria)
//una volta definita la posizione del key frame si preme il bottone per il key frame
//con editing true l'oggetto viene clonato nella sua traiettoria con tutte le sue proprietà

//la prima volta che si preme il bottone per il key frame segna l'inizio dell'animazione

//true se l'entità puntata è stata clonata in tutti i suoi key frames
var stopClone = false;
//editing key frame non abilitato
var editingMode = false;


var properties = ['material.opacity', 'material.color', 'position', 'scale', 'rotation']; //proprietà da modificare
var values = []; //valori da associare alle proprietà
var setted = false; //inizializzazione vettore key frames
var currentFrame = 0; //frame in riproduzione nell'animazione; si può usare anche per la modifica del key frame

//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio) per ora i key frames si generano con un timer;
//un insieme di valori per scegliere quale proprietà manipolare (qui bisogna dare la possibilità all'utente di
//switchare controllo per il transform, magari con una gesture)
//e infine in base alle proprietà i valori da usare
//funzione di prova stringa transform
function stringify(object, flag) {
    //prova traslazione, scala e rotazione, per ora viene modificata solo la posizione
    //se nel tempo del timer si modifica una delle proprietà del transform dell'oggetto, la modifica viene registrata
    if(flag)
        return ((object.x + (targetObject.keyFrames.length + 1) * 2.5) + ' ' + (object.y + targetObject.keyFrames.length * 0.01) + ' ' + (object.z + targetObject.keyFrames.length));
    else
        return (object.x + ' ' + object.y + ' ' + object.z);
}

function randomValues () {
    while(values.length)
        values.pop();
    let opacity, colors, color;
    opacity = Math.random();
    colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
    color = parseInt(Math.random() * 6);
    //gli attributi del transform vengono gestiti dentro la scena, quindi sarebbe utile gestire lo switch della tipologia di transform
    values.push(opacity, colors[color], stringify(targetObject.getAttribute('position'), true), stringify(targetObject.getAttribute('scale'), false), stringify(targetObject.getAttribute('rotation'), false));
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
                        delay: self.data.delay,
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
        }, 5000);
        if(!editingMode)
            //prova inizio animazione (quando la editing mode non è attiva)
            setTimeout(function () {
               animate();
            }, 25000);
        else
            setTimeout(function () {
                createEditor();
            }, 25000);

}

function createEditor () {
    //edit mode key frame attivo: questa porzione di codice deve essere eseguita una sola volta
    //magari innescata da un evento
    if(!stopClone) {
        let clone = null;
        for(let i = 0; i < targetObject.keyFrames.length; i++) {
            //scorri i key frames
            targetObject.flushToDOM(true);
            clone = targetObject.cloneNode(true);
            for(let j = 0; j < targetObject.keyFrames[i].length; j++) {
                //scorri le varie proprietà nel key frame
                if(currentFrame === i) { //frame selezionato dall'utente
                    createFeedback(clone.getAttribute('position'));
                    let array = targetObject.keyFrames[i][j].name.slice(11).split('.');
                    if (array.length > 1)
                        clone.setAttribute(array[0], array[1] + ': ' + targetObject.keyFrames[i][j].values.to);
                    else
                        clone.setAttribute(array[0], targetObject.keyFrames[i][j].values.to);
                } else {
                    clone.setAttribute('material', 'color: #555555; opacity: 0.5');
                }
            }
            document.querySelector('a-scene').appendChild(clone); //fai tanti cloni quanti sono i key frames
        }
        stopClone = true;
    }
}

function animate () {
    if(targetObject.keyFrames.length && targetObject.keyFrames[currentFrame] !== undefined) {
        //assegna il nuovo key frame
        for(let i = 0; i < targetObject.keyFrames[currentFrame].length; i++)
            //assegnamento proprietà
            targetObject.setAttribute(targetObject.keyFrames[currentFrame][i].name, targetObject.keyFrames[currentFrame][i].values);
        //emette l'evento per iniziare l'animazione
        targetObject.emit('start');
        currentFrame++;
        console.log('animazione ' + currentFrame);
    }
}

//TODO
function createFeedback (position) {
    let triangle = document.createElement('a-entity');
    let text = document.createElement('a-entity');
    triangle.setAttribute('geometry', 'primitive: triangle');
    triangle.setAttribute('material', 'color: #0061ff; side: double');
    triangle.setAttribute('rotation', '0 0 180');
    triangle.setAttribute('position', position.x + ' ' + (position.y + 3) + ' ' + position.z);
    text.setAttribute('text-geometry', 'value: ' + currentFrame);
    text.setAttribute('position', (position.x + 0.5) + ' ' + (position.y + 2.75) + ' ' + position.z);
    text.setAttribute('material', 'color: #ffffff');
}

AFRAME.registerComponent('animate', {
    schema: {
        editMode: {type: 'boolean', default: false}, //quando questa proprietà è true, l'utente vede l'oggetto clonato
        //in base ai key frames all'interno della scena
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

    init: function () {
        editingMode = this.data.editMode;
    },

    tick: function () {
        //il componente funziona solo dopo che un certo oggetto è stato puntato
        if(targetObject !== null) {
            //questa porzione di codice viene eseguita una sola volta
            if(!setted) {
                //inizializzazione array key frames dell'oggetto targettato
                targetObject.keyFrames = [];
                setted = true;
                //"test" del componente: partenza della prima animazione
                createKeyFrames(this);
                //registrazione event listener sull'oggetto taggato, nell'event listener della fine di un'animazione
                //si fa partire la successiva
                targetObject.addEventListener('animationcomplete', function () {
                    console.log('animazione completata');
                    animate();
                });
            }
        }
    }
});
