var properties = ['material.opacity', 'material.color'];
var values = [];
var gestureAnimazione = true;
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
    gestureAnimazione = false; //momentaneamete è gestito così per i key frames
    console.log(values);
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

AFRAME.registerComponent('animate', {
    schema: {
        trajectory: {type: 'string', default: ''},
        property: {type: 'string', default: ''},
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
            //gesture selezione key frame
            if(gestureAnimazione) {
                //questa porzione di codice va integrata con la selezione nel menu:
                //la gesture animazione verrà sostituita da un bottone per selezionare il key frame, alla pressione
                //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione

                //genera e assegna i valori
                randomValues();
                //assegna i valori solo se l'oggetto è visibile
                if (values.length !== []) {
                    //assegna i valori in base a properties e values, l'oggetto è targetObject (quindi oggetto precedentemente
                    //selezionato con il componente intersect-and-manipulate)
                    let attributes = []; //attribute avrà sempre 2 locazioni perché sono due le proprietà da modificare
                    for (let i = 0; i < properties.length; i++) {
                        attributes[i] = 'property: ' + properties[i] + '; dur: ' + this.data.duration + '; easing: '
                            + this.data.interpolation + '; to: ' + values[i];
                        targetObject.setAttribute('animation__' + properties[i], attributes[i]);
                        //da definire: start events, pause events, resume events; il from è stato omesso momentaneamete (start property)
                    }

                } else
                    targetObject.setAttribute('animation__visible', 'property: material.opacity; dur: ' + this.data.duration + '; easing: '
                        + this.data.interpolation + '; to: 0');
            }

            //TODO: implementare
            /*//altre gestures per startare e stoppare l'animazione - da integrare col parametro del componente da wrappare
            //verranno emessi degli eventi - c'è il listener nel componente animation
            if(gestureStartAnimation) {

            }

            if(gestureStopAnimation) {

            }*/

            //TODO: per quanto riguarda scalatura e rotazione, registrare la modifica nell'evento holdable prima di salvare tutto per il key frame
            //esempio, condizione per salvare: sequenza scala/rotazione + gesture key frame
            //altrimenti si può controllare se tra un frame e l'altro cambia uno di questi parametri, se si si fa l'animazione apposita (molto più semplice)
        }
    }
});
