//vengono definite qui le proprietà dell'animazione
//quali traiettoria (key frames, alcuni punti nello spazio), per ora i key frames si generano con un timer;
//un insieme di valori per scegliere quale proprietà manipolare
//e infine in base alle proprietà i valori da usare
//per gestire start/stop/resum si emette l'evento con nome corrispondente all'azione
//l'unico problema di queste funzioni temporanee è che se usate con modelli senza material, questo componente viene attaccato
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
                    dur: targetObject.keyFrames.length !== 0? self.data.duration/targetObject.keyFrames.length: self.data.duration,
                    easing: self.data.interpolation, // più uno perché non si conta la posizione
                    from: index !== 1? targetObject.keyFrames[index - 2][i + 1].values.to: (array.length > 1? initialValues[array[1]]: stringify(initialValues[properties[i]])),
                    to: values[i],
                    delay: targetObject.keyFrames.length === 0? self.data.delay: 0,
                    loop: 1,
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
//in base a come viene gestito il sistema per aggiungere punti alla traiettoria(quindi key frames), bisogna gestire il
//ricalcolo dei tempi di animazione dei key frames precedenti
let played = 0; // variabile per la riproduzione di animazioni con ripetizione
let repeat = 0; //ripetizione
//dalla gui, per save key frame, bisogna gestire il bottone in modo che se nessuna modifica è stata effettuata, il bottone
//non possa essere premuto e quindi non sia possibile salvare le modifiche
//sempre dalla gui deve essere data all'utente la possibilità di modificare il from del primo key frame
//si salvano le proprietà iniziali dalle quali l'oggetto da animare deve partire
let initialValues = {
    position: null,
    color: null,
    opacity: null,
    rotation: null,
    scale: null
};
//con la gui sarà possibile modificare il frame selezionato, verrà richiamata la funzione che deve stare al posto di random
//values e che prende le proprietà dell'oggetto e le assegna al key frame
//si può utilizzare anche un event listener sull'oggetto puntato, quando l'utente clicca sul bottone per modificare
//il key frame, viene emesso un evento (e qui viene definito il listener)
//flag per la creazione iniziale della trajettoria
let trajectoryCreated = false;
//per definire i key frames si definisce prima la posizione (quindi la traiettoria)
//una volta definita la posizione del key frame si preme il bottone per il key frame
//con editing true l'oggetto viene clonato nella sua traiettoria con tutte le sue proprietà
//la prima volta che si preme il bottone per il key frame segna l'inizio dell'animazione
//editing key frame non abilitato
let editingMode = false;
let properties = ['material.opacity', 'material.color', 'scale', 'rotation']; //proprietà da modificare
let values = []; //valori da associare alle proprietà
let setted = false; //inizializzazione vettore key frames
let currentFrame = 0; //frame in riproduzione nell'animazione; si può usare anche per la modifica del key frame
//easing functions disponibili
let easingFunctions = ['linear', 'easeInQuad', 'easeOutQuad',	'easeInOutQuad',
    'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
    'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
    'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
    'easeInSine', 'easeOutSine', 'easeInOutSine',
    'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
    'easeInCirc', 'easeOutCirc', 'easeInOutCirc',
    'easeInBack', 'easeOutBack', 'easeInOutBack',
    'easeInElastic', 'easeOutElastic', 'easeInOutElastic'];
let currentEasingFunction = 0; //easing function corrente (scelta dalla gui, utilizzata per l'anteprima)

//values: oggetto javascript con i campi position, color, opacity, rotation, scale
function modifyFrom(values) {
    let properties = ['position', 'opacity', 'color', 'scale', 'rotation'];
    let material = targetObject.aframeEl.getAttribute('material');
    //controllo componente material per collada/obj/ecc
    if(material === null)
        properties.splice(properties.indexOf('opacity', 2));
    for(let i = 0; i < properties.length; i++)
        targetObject.keyFrames[0][i].values.from = values[properties[i]];
}

function addEventListeners (self) {
    //clonare gli event listener
    targetObject.aframeEl.addEventListener('animationcomplete', function () {
        console.log('Animazione completata');
        //continua ad animare
        if(!editingMode && played !== repeat) {
            currentFrame %= targetObject.keyFrames.length;
            animateAll();
        }
        //ripristina lo stato
        if(currentFrame === targetObject.keyFrames.length && played === repeat) {
            console.log('Fine');
            //rimuove gli attributi animazioni dal target object
            setTimeout(function () {
                removeAnimationAttributes(targetObject.clones[0], 0);
                setKeyFrameAttributes(targetObject.aframeEl, 0);
                currentFrame = 0;
                played = 0;
            }, self.data.duration/targetObject.keyFrames.length + self.data.delay + 1000);
        }
    });
    //elimina gli attributi dell'animazione in caso di stop per editing mode
    targetObject.aframeEl.addEventListener('stop', function () {
        if(editingMode)
            removeAnimationAttributes(targetObject.clones[0], 0);
        else
            played = 0; //ripristina lo 0
    })
    //vengono copiati solo questi event listener perché gli altri non verranno più emessi
}

function deleteKeyFrame (self) {
    if(targetObject.clones.length !== 1) { //c'� almeno un altro clone oltre il target object
        console.log('Key frame rimosso');
        //rimozione elemento del key frame selezionato e rimozione key frame
        if (currentFrame !== 0 && currentFrame !== targetObject.keyFrames.length - 1) { //non aggiorna il to/from se viene eliminato l'ultimo key frame o il primo
            //aggiorna to/from
            for (let i = 0; i < targetObject.keyFrames[currentFrame].length; i++) {
                targetObject.keyFrames[currentFrame - 1][i].values.to = targetObject.keyFrames[currentFrame + 1][i].values.from;
                targetObject.keyFrames[currentFrame + 1][i].values.from = targetObject.keyFrames[currentFrame - 1][i].values.to;
            }
        } else if(currentFrame === 0) {
            //se si cerca di eliminare il primo key frame
            //viene riassegnato il targetObject
            targetObject.aframeEl = targetObject.clones[1]; //nuovo key frame zero
            //clona gli event listener
            addEventListeners(self);
        }
        targetObject.clones[currentFrame].parentNode.removeChild(targetObject.clones[currentFrame]);
        targetObject.clones.splice(currentFrame, 1);
        targetObject.keyFrames.splice(currentFrame, 1);
        //cambio key frame (aggiornamento variabile)
        currentFrame++;
        currentFrame = currentFrame % targetObject.keyFrames.length;
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
            dur: targetObject.keyFrames.length !== 0? self.data.duration/targetObject.keyFrames.length: self.data.duration,
            easing: self.data.interpolation,
            from: targetObject.keyFrames.length !== 0? targetObject.keyFrames[targetObject.keyFrames.length - 1][0].values.to: stringify(initialValues.position),
            to: stringify(targetObject.aframeEl.getAttribute('position')),
            delay: targetObject.keyFrames.length === 0? self.data.delay: 0,
            loop: 1,
            startEvents: 'start',
            pauseEvents: 'stop',
            resumeEvents: 'resume'
        }
    }];
    targetObject.keyFrames.push(keyFrame);
    createClone(self);
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
function saveKeyFrame(self) {
    console.log('Key frame salvato');
    //primo caso:
    let values = [];
    let properties = [];
    properties.push('position', 'material.opacity', 'material.color', 'scale', 'rotation');
    //salva anche la nuova posizione perché la traiettoria è già stata definita
    values.push(stringify(targetObject.aframeEl.getAttribute('position')));
    //elimina key frame corrente per sostituirlo con i nuovi valori
    targetObject.keyFrames.splice(currentFrame, 1);
    //inserisce i nuovi valori
    let material = targetObject.aframeEl.getAttribute('material');
    //controllo componente material per collada/obj/ecc
    if(material !== null)
        values.push(material.opacity, material.color);
    else
        properties.splice(properties.indexOf('material.opacity', 2));
    values.push(stringify(targetObject.aframeEl.getAttribute('scale')), stringify(targetObject.aframeEl.getAttribute('rotation')));
    //salva il nuovo key frame
    let attributes = [];
    let keyFrame = [];
    for (let i = 0; i < properties.length; i++) {
        let array = properties[i].split('.');
        attributes[i] = {
            property: properties[i],
            dur: targetObject.keyFrames.length !== 0? self.data.duration/targetObject.keyFrames.length: self.data.duration,
            easing: self.data.interpolation,
            from: currentFrame !== 0? targetObject.keyFrames[currentFrame - 1][i].values.to: (array.length > 1? initialValues[array[1]]: stringify(initialValues[properties[i]])),
            to: values[i],
            delay: targetObject.keyFrames.length === 0? self.data.delay: 0,
            loop: 1,
            startEvents: 'start',
            pauseEvents: 'stop',
            resumeEvents: 'resume'
        };
        //salvataggio key frame (una locazione per ogni proprietà, formano un key frame)
        // si salvano tutte le proprietà compresa la posizione
        keyFrame.push({
            name: 'animation__' + properties[i],
            values: attributes[i]
        });
    }
    //sostituisce il key frame (inserisce un elemento in posizione current frame)
    targetObject.keyFrames.splice(currentFrame, 0, keyFrame);
    if(currentFrame !== targetObject.keyFrames.length - 1)
        for(let i = 0; i < targetObject.keyFrames[currentFrame + 1].length; i++)
            targetObject.keyFrames[currentFrame + 1][i].values.from = targetObject.keyFrames[currentFrame][i].values.to;
}

function setKeyFrameAttributes(clone, i) { //clone e key frame scelto
    for (let j = 0; j < targetObject.keyFrames[i].length; j++) { //scorre le varie proprietà del frame
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

function createClone (self) {
    targetObject.aframeEl.flushToDOM(true);
    let clone = targetObject.aframeEl.cloneNode(true);
    document.querySelector('a-scene').appendChild(clone);
    targetObject.clones.push(clone);
    clone.addEventListener('keyFrameCreated', function () { //la gui deve emettere questo evento alla pressione del bottone
        saveKeyFrame(self);
    });
}

function animateAll () { //usata fuori dall'editor
    if(targetObject.keyFrames.length && targetObject.keyFrames[currentFrame] !== undefined) {
        //assegna il nuovo key frame
        animate(targetObject.aframeEl);
        //emette l'evento per iniziare l'animazione
        targetObject.aframeEl.emit('start');
        currentFrame++;
        console.log('Animazione ' + currentFrame);
        if(currentFrame === targetObject.keyFrames.length)
            played++;
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
            let containerFeedback = document.querySelector('#containerFeedback');
            if(containerFeedback === null) {
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
            document.querySelector('#textFeedback').setAttribute('text-geometry', 'value: ' + (currentFrame + 1));
        } else
            if(targetObject.clones[i].getAttribute('material') !== null)
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

function easingPreview (self) {
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
        }, self.data.duration + self.data.delay + 1000);
        //ripristina il to dell'oggetto
        createFeedback();
    }
}
function parseRepeat (value) {
    let n = parseInt(value);
    if(isNaN(n) || n === 0)
        return true;
    else
        return  n;
}

AFRAME.registerComponent('animate', {
    schema: {
        editMode: {type: 'boolean', default: true}, //quando questa proprietà è true, l'utente vede l'oggetto clonato
        //in base ai key frames all'interno della scena
        //per property e interpolation, nella gui, deve essere mostrato un elenco con le opzioni dispnibili
        //trajectory: {type: 'string', default: ''},
        //property: {type: 'string', oneOf: ['', 'material.color', 'material.opacity', 'rotation', 'scale'], default: ''},
        //value: {type: 'string', default: ''},
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
        repeat: {type: 'string', default: '1'},
        duration: {type: 'float', default: 5000},
        delay: {type: 'float', default: 0}
    },

    init: function () {
        //in base alla stringa inserita, restituisce il valore da usare in animate (k frame)
        //true per infinito, un numero per qualsiasi numero inserito come stringa
        this.data.repeat = parseRepeat(this.data.repeat);
        repeat = this.data.repeat;
    },

    update: function (oldData) {
        if(oldData.repeat !== this.data.repeat) { //aggiornamento ripetizione
            this.data.repeat = parseRepeat(this.data.repeat);
            repeat = this.data.repeat;
        }
        if(setted) {
            if(oldData.interpolation !== this.data.interpolation) {
                currentEasingFunction = this.data.interpolation;
                for (let i = 0; i < targetObject.keyFrames.length; i++)
                    for(let j = 0; j < targetObject.keyFrames[i].length; j++)
                        targetObject.keyFrames[i][j].values.easing = this.data.interpolation; //aggiorna le interpolazioni di tutti i key frames
                }
            if(oldData.duration !== this.data.duration) {
                for (let i = 0; i < targetObject.keyFrames.length; i++)
                    for(let j = 0; j < targetObject.keyFrames[i].length; j++)
                        targetObject.keyFrames[i][j].values.dur = this.data.duration/targetObject.keyFrames.length; //aggiorna la durata di ciascun key frame
            }
            if(oldData.delay !== this.data.delay) {
                if(targetObject.keyFrames.length !== 0)
                    for(let j = 0; j < targetObject.keyFrames[i].length; j++)
                        targetObject.keyFrames[i][j].values.delay = this.data.delay; //aggiorna il ritardo al primo key frame
            }
        }
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
                        easingPreview(self);
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
                    case 81: //q: salva key frame
                        targetObject.clones[currentFrame].emit('keyFrameCreated');
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
                        deleteKeyFrame(self);
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
                    /*case 90: //z: switch control - da inspector
                        createTransform(controls[(currentControl + 1) % controls.length]);
                        break;*/
                }
            }
        };
        //il componente funziona solo dopo che un certo oggetto è stato puntato
        if (targetObject.aframeEl !== null) {
            if(initialValues.position === null) {
                initialValues.position = targetObject.aframeEl.getAttribute('position');
                initialValues.rotation = targetObject.aframeEl.getAttribute('rotation');
                initialValues.scale = targetObject.aframeEl.getAttribute('scale');
                if(targetObject.aframeEl.getAttribute('material') !== null) {
                    initialValues.opacity = targetObject.aframeEl.getAttribute('material').opacity;
                    initialValues.color = targetObject.aframeEl.getAttribute('material').color;
                }
            }
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
                    //elimina l'oggetto originale (che è stato clonato per primo)
                    if(targetObject.clones.length) {
                        targetObject.aframeEl.parentNode.removeChild(targetObject.aframeEl);
                        targetObject.aframeEl = targetObject.clones[0];
                        target = targetObject;
                        addEventListeners(self);
                    }
                    createKeyFrames(self);
                });
                //registrazione event listener sull'oggetto taggato, nell'event listener della fine di un'animazione
                //si fa partire la successiva
                addEventListeners(self);
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
                    targetObject.aframeEl = targetObject.clones[0]; //ripristina il primo clone per l'animazione
                    document.querySelector('#transform').setAttribute('visible', false);
                    currentFrame = 0;
                    feedback.setAttribute('visible', false);
                    for(let i = 1; i < targetObject.clones.length; i++)
                        targetObject.clones[i].setAttribute('visible', false);
                    animateAll();
                }
                //aggiornamento feedback
                if(feedback !== null && this.data.editMode) {
                    let keyFramePosition = targetObject.aframeEl.getAttribute('position');
                    let position = {
                        x: keyFramePosition.x,
                        y: keyFramePosition.y + 2.5,
                        z: keyFramePosition.z
                    };
                    if(position !== feedback.getAttribute('position'))
                        feedback.setAttribute('position', position);
                    feedback.setAttribute('rotation', selectCamera().getAttribute('rotation'));
                }
            }
        }
    }
});
