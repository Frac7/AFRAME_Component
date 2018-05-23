//TODO: gestire le proprietà del transform per l'animazione
//var properties = ['material.opacity', 'material.color', 'position', 'scale', 'rotation'];
var properties = ['material.opacity', 'material.color'];
var values = [];
var setted = false;
var currentFrame = 0;
//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio) per ora i key frames si introducono con la gesture della mano aperta;
//un insieme di valori per scegliere quale proprietà manipolare (qui bisogna dare la possibilità all'utente di
//switchare controllo per il transform, magari con una gesture)
//e infine in base alle proprietà i valori da usare

//verranno tralasciate quindi le proprietà del transform
function randomValues () {
    while(values.length)
        values.pop();
    let opacity, colors, color;
    opacity = Math.random();
    if(opacity !== 0) {
        colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
        color = parseInt(Math.random() * 6);
        //values.push(opacity, colors[color], targetObject.getAttribute('position'), targetObject.getAttribute('scale'), targetObject.getAttribute('rotation'));
        values.push(opacity, colors[color]);
        console.log(values);
    }
}

//nell'altro script deve essere effettuato il riconoscimento della gesture che corrisponde al bottone per il key frame

//viene quindi salvata la posizione e poi vengono assegnate queste proprietà (supponiamo che non siano state generate
//random ma che siano state selezionate dall'utente)

//dall'altro script viene recuperato l'array dei valori
//se questo è vuoto allora la visibilità è false altrimenti le proprietà dell'oggetto presenti in properties
//devono essere modificate con i valori presenti in values

//dopo aver effettuato la gesture si sposta l'oggetto, si seleziona un nuovo key frame e si fa di nuovo la stessa cosa

//deve essere gestita la possibilità di switchare controllo in modo che sia possibile anche modificare le proprietà del transform

//--------------------------------------------------------------------------------------------------------------------//

//metodi da fare:
//riconoscimento gesto per switchare transform, mano aperta
//riconoscimento gesto per selezionare key frame
//problema: deve essere possibile modificare un key frame precedentemente salvato?

//al momento l'animazione viene creata sul targetObject, quindi puntando altri elementi si passa direttamente a creare
//un'altra animazione

//per gestire start/stop/resum si emette l'evento con nome corrispondente all'azione

//funzione temporanea: quando l'elemento è pronto viene generato un key frame ogni 10 secondi
function createKeyFrames (self) {
    //ogni tot viene creato un key frame: crea un key frame ogni 10 secondi, massimo 3 key frames
        let timer = setInterval(function () {
            if(targetObject.keyFrames.length > 3)
                clearInterval(timer);
            else {
                console.log('key frame ' + targetObject.keyFrames.length);
                //questa porzione di codice va integrata con la selezione nel menu:
                //la gesture animazione verrà sostituita da un bottone per selezionare il key frame, alla pressione
                //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione

                //genera i valori
                //al posto di questa funzione, si prelevano i valori dalla gui
                randomValues();
                //assegna i valori solo se l'oggetto è visibile
                if (values.length) {
                    //assegna i valori in base a properties e values, l'oggetto è targetObject
                    // (quindi oggetto precedentemente selezionato con il componente intersect-and-manipulate)
                    let attributes = [];
                    let keyFrame = [];
                    for (let i = 0; i < properties.length; i++) {
                        //per ora scala e rotazione vengono sempre registrati a prescindere dal cambiamento
                        attributes[i] = 'property: ' + properties[i] + '; dur: ' + self.data.duration + '; easing: '
                            + self.data.interpolation + '; to: ' + values[i] + '; delay: ' + self.data.delay + '; loop: ' +
                            self.data.repeat + '; startEvents: start; pauseEvents: end; resumeEvents: resume';
                        //salvataggio key frame (una locazione per ogni proprietà, formano un key frame)
                        keyFrame.push({
                            name: 'animation__' + properties[i],
                            values: attributes[i]
                        });
                    }
                    //salvataggio singolo key frame (una locazione nell'array dei vari key frames)
                    targetObject.keyFrames.push(keyFrame);
                } else {
                    let keyFrame = {
                        name: 'animation__visible',
                        values: 'property: material.opacity; dur: ' + self.data.duration
                        + '; easing: ' + self.data.interpolation + '; to: 0; delay: ' + self.data.delay + '; loop: '
                        + self.data.repeat
                    };
                    //quando si recuperano i key frames è necessario effettuare un controllo del tipo su stringa o array
                    targetObject.keyFrames.push(keyFrame);
                }
                console.log(targetObject.keyFrames);
            }
        }, 10000);
        //prova inizio animazione
        setTimeout(function () {
           animate();
        }, 45000);
}

function animate () {
    if(targetObject.keyFrames.length && targetObject.keyFrames[currentFrame] !== undefined) {
        //assegna il nuovo key frame
        for(let i = 0; i < targetObject.keyFrames[currentFrame].length; i++)
            targetObject.setAttribute(targetObject.keyFrames[currentFrame][i].name, targetObject.keyFrames[currentFrame][i].values);
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
