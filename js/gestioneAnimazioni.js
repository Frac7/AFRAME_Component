//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio), per ora i key frames si generano con un timer;
//un insieme di valori per scegliere quale proprietà manipolare
//e infine in base alle proprietà i valori da usare
//per gestire start/stop/resum si emette l'evento con nome corrispondente all'azione
//funzione temporanea
function randomValues () {
    while(values.length)
        values.pop();
    let opacity, colors, color;
    opacity = Math.random();
    colors = ['#0000FF', '#00FF00', '#FF0000', '#000000', '#FFFFFF', '#FF6400', '#FFE100'];
    color = parseInt(Math.random() * colors.length);
    values.push(opacity, colors[color], stringify(targetObject.aframeEl.getAttribute('scale')), stringify(targetObject.aframeEl.getAttribute('rotation')));
}

//funzione temporanea
function createKeyFrames (self) {
    let index = 0;
    console.log('Generazione valori');
    //ogni tot viene creato un key frame: crea un key frame ogni 5 secondi, massimo 3 key frames
    let timer = setInterval(function () {
        if(index > 2) {
            console.log('Valori generati: ');
            console.log(targetObject.keyFrames);
            clearInterval(timer);
        } else {
            index++;
            console.log('Key frame ' + index);
            //questa porzione di codice va integrata con la selezione nel menu:
            //il timer verrà sostituito da un bottone per selezionare il key frame, alla pressione
            //di questo bottone, tutte le proprietà dell'oggetto vengono salvate e viene creata l'animazione
            //genera i valori: al posto di questa funzione, si prelevano i valori dalla gui
            randomValues();
            //assegna i valori in base a properties e values, l'oggetto è targetObject.aframeEl
            //(quindi oggetto precedentemente selezionato con il componente intersect-and-manipulate)
            let attributes = [];
            for (let i = 0; i < properties.length; i++) {
                let array = properties[i].split('.');
                attributes[i] = {
                    property: properties[i],
                    dur: self.data.duration,
                    easing: self.data.interpolation, // più uno perché non si conta la posizione
                    from: index !== 1? targetObject.keyFrames[index - 2][i + 1].values.to: (array.length > 1? targetObject.aframeEl.getAttribute(array[0])[array[1]]: targetObject.aframeEl.getAttribute(properties[i])),
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
            animateAll();
        }, 20000);
    else
        setTimeout(function () {
            console.log('Editor');
            createFeedback(); //la prima volta che l'editor è creato, il frame corrente è zero
        }, 20000);

}

//con la gui sarà possibile modificare il frame selezionato, verrà richiamata la funzione che deve stare al posto di random
//values e che prende le proprietà dell'oggetto e le assegna al key frame
//si può utilizzare anche un event listener sull'oggetto puntato, quando l'utente clicca sul bottone per modificare
//il key frame, viene emesso un evento (e qui viene definito il listener)
//flag per la creazione iniziale della trajettoria
var trajectoryCreated = false;
var case2 = false; //caso due: modifica key frame (significa che l'evento di fine traiettoria è già stato definito)
//per definire i key frames si definisce prima la posizione (quindi la traiettoria)
//una volta definita la posizione del key frame si preme il bottone per il key frame
//con editing true l'oggetto viene clonato nella sua traiettoria con tutte le sue proprietà
//la prima volta che si preme il bottone per il key frame segna l'inizio dell'animazione
//editing key frame non abilitato
var editingMode = false;
var properties = ['material.opacity', 'material.color', 'scale', 'rotation']; //proprietà da modificare
var values = []; //valori da associare alle proprietà
var setted = false; //inizializzazione vettore key frames
var currentFrame = 0; //frame in riproduzione nell'animazione; si può usare anche per la modifica del key frame
//easing functions disponibili
var easingFunctions = ['linear', 'easeInQuad', 'easeOutQuad',	'easeInOutQuad',
    'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
    'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
    'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
    'easeInSine', 'easeOutSine', 'easeInOutSine',
    'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
    'easeInCirc', 'easeOutCirc', 'easeInOutCirc',
    'easeInBack', 'easeOutBack', 'easeInOutBack',
    'easeInElastic', 'easeOutElastic', 'easeInOutElastic'];
var currentEasingFunction = 0; //easing function corrente (scelta dalla gui, utilizzata per l'anteprima)

function addEventListeners () {
    //clonare gli event listener
    targetObject.aframeEl.addEventListener('animationcomplete', function () {
        console.log('Animazione completata');
        //continua ad animare
        if(!editingMode)
            animateAll();
        //ripristina lo stato
        if(currentFrame === targetObject.keyFrames.length) {
            //rimuove gli attributi animazioni dal target object
            setTimeout(function () {
                removeAnimationAttributes(targetObject.clones[0], 0);
                setKeyFrameAttributes(targetObject.aframeEl, 0);
            }, 6000);
        }
    });
    targetObject.aframeEl.addEventListener('keyFrameCreated', function () { //la gui deve emettere questo evento alla pressione del bottone
        saveKeyFrame();
    });
    //vengono copiati solo questi event listener perché gli altri non verranno più emessi
}
function deleteKeyFrame () {
    if(targetObject.clones.length !== 1) { //c'è almeno un altro clone oltre il target object
        targetObject.clones[currentFrame].parentNode.removeChild(targetObject.clones[currentFrame]);
        targetObject.clones.splice(currentFrame, 1);
        targetObject.keyFrames.splice(currentFrame, 1);
        console.log('Key frame rimosso');
        //rimozione elemento del key frame selezionato e rimozione key frame
        if (currentFrame !== 0) {
            //aggiorna to/from
            if (currentFrame !== (targetObject.keyFrames.length - 1)) //non aggiorna il to/from se viene eliminato l'ultimo key frame
                for (let i = 0; i < targetObject.keyFrames[currentFrame].length; i++) {
                    targetObject.keyFrames[currentFrame - 1][i].values.to = targetObject.keyFrames[currentFrame + 1][i].values.from;
                    targetObject.keyFrames[currentFrame + 1][i].values.from = targetObject.keyFrames[currentFrame - 1][i].values.to;
                }
        } else {
            //se si cerca di eliminare il primo key frame
            //viene riassegnato il targetObject
            targetObject.aframeEl = targetObject.clones[0]; //nuovo key frame zero
            //clona gli event listener
            addEventListeners();
        }
        //cambio key frame (aggiornamento variabile)
        currentFrame++;
        if (currentFrame >= targetObject.keyFrames.length)
            currentFrame = 0;
        createFeedback();
    }
}

//creazione della traiettoria per l'oggetto dell'animazione
function createPoint (self) {
    console.log('Creazione traiettoria');
    //definizione key frames con un tap, giusto per provare
    console.log('Hai creato un key frame, creati: ' + (targetObject.keyFrames.length + 1));
    //salvataggio posizine come primo valore del key frame
    let keyFrame = [{
        name: 'animation__position',
        values: {
            property: 'position',
            dur: self.data.duration,
            easing: self.data.interpolation,
            from: targetObject.keyFrames.length !== 0? targetObject.keyFrames[targetObject.keyFrames.length - 1][0].values.to: stringify(targetObject.aframeEl.getAttribute('position')),
            to: stringify(targetObject.aframeEl.getAttribute('position')),
            delay: self.data.delay,
            loop: self.data.repeat,
            startEvents: 'start',
            pauseEvents: 'stop',
            resumeEvents: 'resume'
        }
    }];
    targetObject.keyFrames.push(keyFrame);
    createClone();
    if (targetObject.keyFrames.length > 2) {
        for(let i = 0; i < targetObject.keyFrames[0].length; i++)
            targetObject.aframeEl.setAttribute(targetObject.keyFrames[0][i].name, targetObject.keyFrames[0][i].values);
        targetObject.aframeEl.emit('trajectoryCreated');
    }
}

//funzione di prova stringa transform
function stringify(object) {
    //se nel tempo del timer si modifica una delle proprietà del transform dell'oggetto, la modifica viene registrata
    return (object.x + ' ' + object.y + ' ' + object.z);
}

//questa funzione salva i valori dell'oggetto puntato alla pressione del bottone per il salvataggio del keyframe
//ci sono due casi: il primo è quello in cui il key frame viene creato per la prima volta,
//il secondo caso è quello in cui il key frame viene modificato
function saveKeyFrame(self) {
    //primo caso:
    let values = [];
    let properties = ['material.opacity', 'material.color', 'scale', 'rotation'];
    //inserisce i nuovi valori
    values.push(targetObject.aframeEl.getAttribute('material').opacity, targetObject.aframeEl.getAttribute('material').color, stringify(targetObject.aframeEl.getAttribute('scale')), stringify(targetObject.aframeEl.getAttribute('rotation')));
    if(case2) { //salva anche la nuova posizione
        values.push(targetObject.aframeEl.getAttribute('position'));
        properties.push('position');
    }
    //salva il nuovo key frame
    let attributes = [];
    for (let i = 0; i < properties.length; i++) {
        let array = properties[i].split('.');
        attributes[i] = {
            property: properties[i],
            dur: currentFrame !== 0? self.data.duration: 100,
            easing: self.data.interpolation,
            from: currentFrame !== 0? targetObject.keyFrames[currentFrame - 1][i + 1].values.to: (array.length > 1? targetObject.aframeEl.getAttribute(array[0])[array[1]]: targetObject.aframeEl.getAttribute(properties[i])),
            to: values[i],
            delay: self.data.delay,
            loop: self.data.repeat,
            startEvents: 'start',
            pauseEvents: 'stop',
            resumeEvents: 'resume'
        };
        //salvataggio key frame (una locazione per ogni proprietà, formano un key frame)
        targetObject.keyFrames[currentFrame].push({
            name: 'animation__' + properties[i],
            values: attributes[i]
        });
    }
}

function setKeyFrameAttributes(clone, i) { //clone e key frame scelto
    for (let j = 0; j < targetObject.keyFrames[i].length; j++) { //scorre le varie proprietà del frame
        //TODO: nella modalità editing non viene aggiornato il key frame zero, capire come gestire la questione to/from nell'editor
        let array = targetObject.keyFrames[i][j].name.slice(11).split('.');
        if (array.length > 1)
            clone.setAttribute(array[0], array[1] + ': ' + targetObject.keyFrames[i][j].values.to);
        else
            clone.setAttribute(array[0], targetObject.keyFrames[i][j].values.to);
    }
}

function removeAnimationAttributes(clone, i) { //clone e key frame scelto
    for (let j = 0; j < targetObject.keyFrames[i].length; j++)
        clone.removeAttribute(targetObject.keyFrames[i][j].name);
}

function createClone () {
    targetObject.aframeEl.flushToDOM(true);
    let clone = targetObject.aframeEl.cloneNode(false);
    document.querySelector('a-scene').appendChild(clone);
    targetObject.clones.push(clone);
}

function animateAll () { //usata fuori dall'editor
    if(targetObject.keyFrames.length && targetObject.keyFrames[currentFrame] !== undefined) {
        //assegna il nuovo key frame
        animate(targetObject.aframeEl);
        //emette l'evento per iniziare l'animazione
        targetObject.aframeEl.emit('start');
        currentFrame++;
        console.log('Animazione ' + currentFrame);
    }
}

function createFeedback () {
    console.log('Creazione feedback: ' + (currentFrame + 1));
    for(let i = 0; i < targetObject.clones.length; i++) {
        //assegnameto proprietà editor: from values
        if(i === currentFrame) {
            targetObject.aframeEl = targetObject.clones[i]; //aggiornamento target object per spostamento controllo transform
            //unico frame dell'editor con le proprietà attive, frame attivo
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
                text.setAttribute('position', '-0.2 0 0');
                text.setAttribute('material', 'color: #ffffff');
                text.setAttribute('scale', '1 1 0.1');
                container.appendChild(text);
                container.appendChild(triangle);
                document.querySelector('a-scene').appendChild(container);
            }
            setKeyFrameAttributes(targetObject.clones[i], i);
            createTransform(controls[currentControl]);
            document.querySelector('#containerFeedback').setAttribute('rotation', document.querySelector('[camera]').getAttribute('rotation')); //si può spostare per un controllo dinamico
            document.querySelector('#containerFeedback').setAttribute('position', position.x + ' ' + (position.y + 2.5) + ' ' + position.z);
            document.querySelector('#textFeedback').setAttribute('text-geometry', 'value: ' + (currentFrame + 1));
        } else
            targetObject.clones[i].setAttribute('material', 'color: #555555; opacity: 0.5');
        //frame non attivo
    }
}

//anima singolo frame
function animate (targetObjectParameter) {
    for(let i = 0; i < targetObject.keyFrames[currentFrame].length; i++)
        //assegnamento proprietà: to values
        targetObjectParameter.setAttribute(targetObject.keyFrames[currentFrame][i].name, targetObject.keyFrames[currentFrame][i].values);
}

function previewEasing (self) {
    //questa funzione mostra un'anteprima della funzione di easing scelta
    //agisce sul frame corrente nella modalità editing
    if(self.data.editMode) {
        let index = 0;
        //fai l'animazione tre volte
        let timer = setInterval(function () {
            if(index > 2) {
                removeAnimationAttributes(targetObject.clones[currentFrame], currentFrame);
                clearInterval(timer);
            } else {
                index++;
                console.log(index);
                animate(targetObject.clones[currentFrame]);
                targetObject.clones[currentFrame].emit('start');
            }
        //}, self.data.dur);
        }, 5000);
        //ripristina il from dell'oggetto
        createFeedback();
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
        interpolation: {type: 'string', oneOf:
            ['linear', 'easeInQuad', 'easeOutQuad',	'easeInOutQuad',
            'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
            'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
            'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
            'easeInSine', 'easeOutSine', 'easeInOutSine',
            'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
            'easeInCirc', 'easeOutCirc', 'easeInOutCirc',
            'easeInBack', 'easeOutBack', 'easeInOutBack',
            'easeInElastic', 'easeOutElastic', 'easeInOutElastic'], default: 'linear'},
        repeat: {type: 'int', default: 1},
        duration: {type: 'float', default: 5000},
        delay: {type: 'float', default: 0}
    },

    tick: function () {
        //tasti
        let self = this;
        //aggiornamento variabile globale
        editingMode = this.data.editMode;
        document.getElementsByTagName('body')[0].onkeyup = function (event) {
            if(targetObject.aframeEl !== null) {
                switch (event.which) {
                    case 66: //b: crea traiettoria
                        targetObject.aframeEl.emit('createPoint');
                        break;
                    case 67: //c: anteprima funzione di easing
                        previewEasing(self);
                        break;
                    case 69: //e: modalità di editing on/off
                        self.data.editMode = !self.data.editMode;
                        break;
                    case 70: //f: switch easing function
                        if(self.data.editMode) {
                            currentEasingFunction++;
                            if (currentEasingFunction === easingFunctions.length)
                                currentEasingFunction = 0;
                            self.data.easing = easingFunctions[currentEasingFunction];
                            console.log(self.data.easing);
                        }
                        break;
                    case 82: //r: start (anche emettendo l'evento, per animare ci vuole l'attributo)
                        if(!self.data.editMode)
                            animateAll();
                        break;
                    case 84: //t: resume
                        if(!self.data.editMode)
                            targetObject.aframeEl.emit('resume');
                        break;
                    case 85: //u: stop
                        if(!self.data.editMode)
                            targetObject.aframeEl.emit('stop');
                        break;
                    case 86: //v: elimina key frame
                        deleteKeyFrame();
                        break;
                    case 88: //x: frame +
                        if(self.data.editMode) {
                            currentFrame++;
                            if (currentFrame >= targetObject.keyFrames.length)
                                currentFrame = 0;
                            createFeedback();
                            target = targetObject.clones[currentFrame];
                        }
                        break;
                    case 89: //y: frame -
                        if(self.data.editMode) {
                            currentFrame--;
                            if (currentFrame < 0)
                                currentFrame = targetObject.keyFrames.length - 1;
                            createFeedback();
                            target = targetObject.clones[currentFrame];
                        }
                        break;
                    case 90: //z: switch control
                        createTransform(controls[(currentControl + 1) % controls.length], document);
                        break;
                }
            }
        };
        //il componente funziona solo dopo che un certo oggetto è stato puntato
        if (targetObject.aframeEl !== null) {
            //questa porzione di codice viene eseguita una sola volta
            if (!setted) {
                //inizializzazione array key frames dell'oggetto targettato
                targetObject.keyFrames = [];
                targetObject.clones = [];
                setted = true;
                //crea la traiettoria
                targetObject.aframeEl.addEventListener('createPoint', function () {
                    createPoint(self);
                });
                //"test" del componente
                targetObject.aframeEl.addEventListener('trajectoryCreated', function () {
                    case2 = true;
                    //elimina l'oggetto originale (che è stato clonato per primo)
                    if(targetObject.clones.length) {
                        targetObject.aframeEl.parentNode.removeChild(targetObject.aframeEl);
                        targetObject.aframeEl = targetObject.clones[0];
                        target = targetObject;
                        addEventListeners();
                    }
                    createKeyFrames(self);
                });
                //registrazione event listener sull'oggetto taggato, nell'event listener della fine di un'animazione
                //si fa partire la successiva
                addEventListeners();
            } else {
                //si può provare cambiando la modalità dall'inspector
                let feedback = document.querySelector('#containerFeedback');
                //passaggio dalla modalità di animazione alla modalità di editor
                if(this.data.editMode && feedback !== null && !feedback.getAttribute('visible')) {
                    //stop animazione
                    targetObject.aframeEl.emit('stop');
                    document.querySelector('#transform').setAttribute('visible', true);
                    currentFrame = 0;
                    feedback.setAttribute('visible', true);
                    for(let i = 1; i < targetObject.clones.length; i++)
                        targetObject.clones[i].setAttribute('visible', true);
                    //rimuove gli attributi delle animazioni
                    createFeedback();
                }
                //passaggio dalla modalità di editor alla modalità di animazione
                if(!this.data.editMode && feedback !== null && feedback.getAttribute('visible')) {
                    targetObject.aframeEl = targetObject.aframeEl.clones[0]; //ripristina il primo clone per l'animazione
                    document.querySelector('#transform').setAttribute('visible', false);
                    currentFrame = 0;
                    feedback.setAttribute('visible', false);
                    for(let i = 1; i < targetObject.clones.length; i++)
                        targetObject.clones[i].setAttribute('visible', false);
                    animateAll();
                }
                //aggiornamento feedback, solo la x e la z sono uguali TODO: provare
                if(feedback !== null && this.data.editMode) {
                    let keyFramePosition = targetObject.aframeEl.getAttribute('position');
                    let position = {
                        x: keyFramePosition.x,
                        y: keyFramePosition.y + 2.5,
                        z: keyFramePosition.z
                    };
                    if(position !== feedback.getAttribute('position'))
                        createFeedback();
                }
            }
        }
    }
});
