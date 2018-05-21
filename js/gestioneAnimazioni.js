var properties = ['material.opacity', 'material.color', 'scale', 'rotation'];
var values = [];
var setted = false;
//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio) per ora i key frames si introducono con la gesture della mano aperta;
//un insieme di valori per scegliere quale proprietà manipolare (qui bisogna dare la possibilità all'utente di
//switchare controllo per il transform, magari con una gesture)
//e infine in base alle proprietà i valori da usare

//verranno tralasciate quindi le proprietà del transform
function randomValues () {
    let opacity = 0, colors = [], color = '';
    opacity = Math.random();
    if(opacity !== 0) {
        colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
        color = parseInt(Math.random() * 6);
        values = [opacity, colors[color]];
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

//si assume che venga utilizzata la mano destra per i key frames, tanto questo verrà sostituito dal bottone
function gestureAnimazione (hand) {
    //TODO: da rivedere perché il valore viene sovrascritto
    let oldRotation = targetObject.getAttribute('rotation');
    let oldScale = targetObject.getAttribute('scale');
    targetObject.oldParameters.oldRotation = oldRotation;
    targetObject.oldParameters.oldScale = oldScale;
    return (hand && (Math.abs(hand.palmNormal[1]) < 0.5 && Math.abs(hand.palmNormal[0]) < 0.5) && hand.pointables[0].extended && hand.pointables[1].extended && hand.pointables[2].extended && hand.pointables[3].extended && hand.pointables[4].extended);
}

function gestureStartAnimation () {

}

function gestureStopAnimation () {

}

function gestureResumeAnimation () {

}

AFRAME.registerComponent('animate', {
    schema: {
        //per property e interpolation, nella gui, deve essere mostrato un elenco con le opzioni dispnibili
        property: {type: 'string', oneOf: ['', 'material.color', 'material.opacity', 'rotation', 'scale'], default: ''},
        value: {type: 'string', default: ''},
        interpolation: {type: 'string', oneOf: ['linear', 'elastic', 'back'], default: 'linear'},
        repeat: {type: 'string', default: '1'},
        duration: {type: 'float', default: 1000},
        delay: {type: 'float', default: 0}
    },

    init: function () {

    },

    tick: function () {
        if(targetObject !== null) {
            if(!setted) {
                targetObject.oldParameters = {
                    oldScale: {
                        x: null,
                        y: null,
                        z: null
                    },
                    oldRotation: {
                        x: null,
                        y: null,
                        z: null
                    }
                };
                setted = true;
            }
            //gesture selezione key frame
            if(gestureAnimazione(gestureHand.components['leap-hand'].getHand())) {
                console.log('gesture key frame');
                //questa porzione di codice va integrata con la selezione nel menu:
                //la gesture animazione verrà sostituita da un bottone per selezionare il key frame, alla pressione
                //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione

                //genera e assegna i valori
                randomValues();
                //assegna i valori solo se l'oggetto è visibile
                if (values.length !== []) {
                    //assegna i valori in base a properties e values, l'oggetto è targetObject (quindi oggetto precedentemente
                    //selezionato con il componente intersect-and-manipulate)
                    let attributes = [];
                    for (let i = 0; i < properties.length; i++) {
                        if(properties[i] === 'material.opacity' || properties[i] === 'material.color' || (properties[i] === 'scale' && targetObject.getAttribute('scale') !== targetObject.oldScale) || (properties[i] === 'rotation' && targetObject.getAttribute('rotation') !== targetObject.oldRotation)) {
                            attributes[i] = 'property: ' + properties[i] + '; dur: ' + this.data.duration + '; easing: '
                                + this.data.interpolation + '; to: ' + values[i] + '; delay: ' + this.data.delay + '; repeat: ' +
                                this.data.repeat + '; startEvents: start; pauseEvents: end; resumeEvents: resume';
                            targetObject.setAttribute('animation__' + properties[i], attributes[i]);
                        }
                    }
                } else
                    targetObject.setAttribute('animation__visible', 'property: material.opacity; dur: ' + this.data.duration
                        + '; easing: ' + this.data.interpolation + '; to: 0; delay: ' + this.data.delay + '; repeat: '
                        + this.data.repeat);
                //salvataggio posizione per traiettoria oggetto
                //da provare, in questo modo dovrebbe essere possibile avere un'unica traiettoria per un oggetto
                //in questo modo sarebbe giusto necessario gestire la cancellazione di una traiettoria quando si
                //vuole fare una nuova animazione sullo stesso oggetto
                targetObject.trajectory.push(targetObject.getAttribute('position'));
            }

            //altre gestures per startare e stoppare l'animazione - da integrare col parametro del componente da wrappare
            //verranno emessi degli eventi - c'è il listener nel componente animation
            if(gestureStartAnimation)
                this.el.emit('start');

            if(gestureResumeAnimation)
                this.el.emit('resume');

            if(gestureStopAnimation)
                this.el.emit('end');
        }
    }
});
