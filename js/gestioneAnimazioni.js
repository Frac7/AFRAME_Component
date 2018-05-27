//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio) per ora i key frames si generano con un timer;
//un insieme di valori per scegliere quale proprietà manipolare (qui bisogna dare la possibilità all'utente di
//switchare controllo per il transform, magari con una gesture)
//e infine in base alle proprietà i valori da usare
//funzione temporanea, di prova

function randomValues () {
    while(values.length)
        values.pop();
    let opacity, colors, color;
    opacity = Math.random();
    colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
    color = parseInt(Math.random() * 6);
    //gli attributi del transform vengono gestiti dentro la scena, quindi sarebbe utile gestire lo switch della tipologia di transform
    values.push(opacity, colors[color], stringify(targetObject.getAttribute('scale')), stringify(targetObject.getAttribute('rotation')));
}

//funzione temporanea

function createKeyFrames (self) {
    let index = 0;
    console.log('Generazione valori');
    //ogni tot viene creato un key frame: crea un key frame ogni 10 secondi, massimo 3 key frames
    let timer = setInterval(function () {
        if(index > 2) {
            console.log('Valori generati: ');
            console.log(targetObject.keyFrames);
            clearInterval(timer);
        }
        else {
            index++;
            console.log('Key frame ' + index);
            //questa porzione di codice va integrata con la selezione nel menu:
            //il timer verrà sostituito da un bottone per selezionare il key frame, alla pressione
            //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione

            //genera i valori
            //al posto di questa funzione, si prelevano i valori dalla gui
            randomValues();
            //assegna i valori in base a properties e values, l'oggetto è targetObject
            //(quindi oggetto precedentemente selezionato con il componente intersect-and-manipulate)
            let attributes = [];
            for (let i = 0; i < properties.length; i++) {
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
                targetObject.keyFrames[index - 1].push({
                    name: 'animation__' + properties[i],
                    values: attributes[i]
                });
            }
        }
    }, 5000);
    //prove con timer
    if(!editingMode)
    //prova inizio animazione (quando la editing mode non è attiva)
        setTimeout(function () {
            console.log('Animate');
            animate();
        }, 20000);
    else
        setTimeout(function () {
            console.log('Editor');
            createEditor();
            createFeedback(); //la prima volta che l'editor è creato, il frame corrente è zero
        }, 20000);

}

//con la gui sarà possibile modificare il frame selezionato, verrà richiamata la funzione che deve stare al posto di random
//values e che prende le proprietà dell'oggetto e le assegna al key frame
//si può utilizzare anche un event listener sull'oggetto puntato, quando l'utente clicca sul bottone per modificare
//il key frame, viene emesso un evento (e qui viene definito il listener)

//flag per la creazione iniziale della trajettoria
var trajectoryCreated = false;

//per definire i key frames si definisce prima la posizione (quindi la traiettoria)
//una volta definita la posizione del key frame si preme il bottone per il key frame
//con editing true l'oggetto viene clonato nella sua traiettoria con tutte le sue proprietà

//la prima volta che si preme il bottone per il key frame segna l'inizio dell'animazione

//true se l'entità puntata è stata clonata in tutti i suoi key frames
var stopClone = false;
//editing key frame non abilitato
var editingMode = false;

var properties = ['material.opacity', 'material.color', 'scale', 'rotation']; //proprietà da modificare
var values = []; //valori da associare alle proprietà
var setted = false; //inizializzazione vettore key frames
var currentFrame = 0; //frame in riproduzione nell'animazione; si può usare anche per la modifica del key frame

//creazione della traiettoria per l'oggetto dell'animazione

function createTrajectory (self) {
    console.log('Creazione traiettoria');
    //definizione key frames con un tap, giusto per provare
    LeapMotionController.on('gesture', function(gesture) {
        if(setted) { //l'array dei keyframes per il targetObject esiste
            if (gesture.type === 'swipe' && gesture.state === 'stop' && targetObject.keyFrames.length === 3) { //swipe frame
                let n = 0;
                if (gesture.direction[0] > 0) {
                    console.log('Swipe right');
                    n = -1;
                } else {
                    console.log('Swipe left');
                    n = 1;
                }
                currentFrame = Math.abs((currentFrame + n) % targetObject.keyFrames.length);
                createFeedback();
            }
            if (gesture.type === 'screenTap' && gesture.state === 'stop' && targetObject.keyFrames.length < 3) {
                console.log('Hai creato un key frame, creati: ' + (targetObject.keyFrames.length + 1));
                //salvataggio posizine come primo valore del key frame
                let keyFrame = [{
                    name: 'animation__position',
                    values: {
                        property: 'position',
                        dur: self.data.duration,
                        easing: self.data.interpolation,
                        to: stringify(targetObject.getAttribute('position')),
                        delay: self.data.delay,
                        loop: self.data.repeat,
                        startEvents: 'start',
                        pauseEvents: 'stop',
                        resumeEvents: 'resume'
                    }
                }];
                targetObject.keyFrames.push(keyFrame);
                if (targetObject.keyFrames.length > 2)
                    targetObject.emit('trajectoryCreated');
            }
        }
    });
}

//funzione di prova stringa transform

function stringify(object) {
    //se nel tempo del timer si modifica una delle proprietà del transform dell'oggetto, la modifica viene registrata
    return (object.x + ' ' + object.y + ' ' + object.z);
}

//questa funzione salva i valori dell'oggetto puntato alla pressione del bottone per il salvataggio del keyframe

function saveKeyFrame() {
    //svuota l'array dei valori
    while(values.length)
        values.pop();
    //inserisce i nuovi valori
    values.push(targetObject.getAttribute('material').opacity, targetObject.getAttribute('material').color, stringify(targetObject.getAttribute('scale')), stringify(targetObject.getAttribute('rotation')));
    //salva il nuovo key frame
    let attributes = [];
    for (let i = 0; i < properties.length; i++) {
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
        targetObject.keyFrames[currentFrame].push({ //gestione della variabile current frame...
            name: 'animation__' + properties[i],
            values: attributes[i]
        });
    }
}

//viene quindi salvata la posizione e poi vengono assegnate queste proprietà all'animazione
//(supponiamo che non siano state generate random ma che siano state selezionate dall'utente)

//viene recuperato l'array dei valori
//le proprietà dell'oggetto presenti in properties devono essere modificate con i valori presenti in values

//dopo aver creato il key frame, si sposta l'oggetto e si modificano le proprietà, si seleziona un nuovo key frame

//per gestire start/stop/resum si emette l'evento con nome corrispondente all'azione

function setKeyFrameAttributes(clone, i) { //clone e key frame scelto
    for (let j = 0; j < targetObject.keyFrames[i].length; j++) { //scorre le varie proprietà del frame
        let array = targetObject.keyFrames[i][j].name.slice(11).split('.');
        if (array.length > 1)
            clone.setAttribute(array[0], array[1] + ': ' + targetObject.keyFrames[i][j].values.to);
        else
            clone.setAttribute(array[0], targetObject.keyFrames[i][j].values.to);
    }
}

//NB: il primo key frame è l'oggetto puntato. qui si generano valori anche per l'oggetto puntato, quindi si ignora
//il suo stato iniziale. con una gui si prelevano i valori definiti dall'utente al posto dei random values

function createEditor () {
    targetObject.clones = [];
    //edit mode key frame attivo: questa porzione di codice deve essere eseguita una sola volta
    //magari innescata da un evento
    if(!stopClone) {
        let clone = null;
        for(let i = 0; i < targetObject.keyFrames.length; i++) {
            if(i !== 0) {
                //scorri i key frames
                targetObject.flushToDOM(true);
                clone = targetObject.cloneNode(true);
                //tanti cloni quanti sono i key frames - 1
                document.querySelector('a-scene').appendChild(clone);
            } else
                clone = targetObject; //il primo key frames è il target object, gli si assegnano le proprietà del primo key frame
            targetObject.clones.push(clone);
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
        console.log('Animazione ' + currentFrame);
    }
}

function createFeedback () {
    console.log('Creazione feedback');
    for(let i = 0; i < targetObject.clones.length; i++) {
        if(i === currentFrame) {
            console.log('Frame corrente: ' + (currentFrame + 1));
            let position = targetObject.clones[i].getAttribute('position');
            if(document.querySelector('#containerFeedback') === null) {
                let triangle = document.createElement('a-entity');
                triangle.setAttribute('id', 'triangleFeedback');
                let text = document.createElement('a-entity');
                text.setAttribute('id', 'textFeedback');
                let container = document.createElement('a-entity');
                container.setAttribute('id', 'containerFeedback');
                triangle.setAttribute('geometry', 'primitive: triangle');
                triangle.setAttribute('material', 'color: #0061ff; side: double');
                triangle.setAttribute('rotation', '0 0 180');
                triangle.setAttribute('position', '0 0 0');
                text.setAttribute('position', '-0.25 0 0');
                text.setAttribute('material', 'color: #ffffff');
                text.setAttribute('scale', '1 1 0.1');
                container.appendChild(text);
                container.appendChild(triangle);
                document.querySelector('a-scene').appendChild(container);
            }
            document.querySelector('#containerFeedback').setAttribute('rotation', document.querySelector('[camera]').getAttribute('rotation')); //si può spostare per un controllo dinamico
            document.querySelector('#containerFeedback').setAttribute('position', position.x + ' ' + (position.y + 2.5) + ' ' + position.z);
            document.querySelector('#textFeedback').setAttribute('text-geometry', 'value: ' + (currentFrame + 1));
            setKeyFrameAttributes(targetObject.clones[i], i);
        } else
            targetObject.clones[i].setAttribute('material', 'color: #555555; opacity: 0.5');
    }

}

AFRAME.registerComponent('animate', {
    schema: {
        editMode: {type: 'boolean', default: true}, //quando questa proprietà è true, l'utente vede l'oggetto clonato
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
        editingMode = this.data.editMode; //temporanea
    },

    tick: function () {
        //il componente funziona solo dopo che un certo oggetto è stato puntato
        if (targetObject !== null) {
            //questa porzione di codice viene eseguita una sola volta
            if (!setted) {
                //inizializzazione array key frames dell'oggetto targettato
                targetObject.keyFrames = [];
                //crea la traiettoria se questa non esiste (a prescindere dalla modalità di edting)
                createTrajectory(this); //il numero di key frames è bloccato a 3
                //"test" del componente: partenza della prima animazione
                let self = this;
                targetObject.addEventListener('trajectoryCreated', function () {
                    createKeyFrames(self);
                });
                //registrazione event listener sull'oggetto taggato, nell'event listener della fine di un'animazione
                //si fa partire la successiva
                targetObject.addEventListener('animationcomplete', function () {
                    console.log('Animazione completata');
                    animate();
                });
                setted = true;
                /*targetObject.addEventListener('keyFrameCreated', function () { //la gui deve emettere questo evento alla pressione del bottone
                    saveKeyFrame();
                });*/
            }
        }
    }
});
