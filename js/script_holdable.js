function selectHand (i)
{
    switch (i)
    {
        case 3:
            //selezione della posizione del pollice sui tre assi
            if(hand.type === 'right' && document.querySelector('#r').components['leap-hand'].getHand() !== null && document.querySelector('#r').components['leap-hand'].getHand() !== undefined && document.querySelector('#r').components['leap-hand'].getHand())
                handTick = document.querySelector('#r').components['leap-hand'].getHand().pointables[0].tipPosition;
            else if(hand.type === 'left' && document.querySelector('#l').components['leap-hand'].getHand() !== null && document.querySelector('#l').components['leap-hand'].getHand() !== undefined && document.querySelector('#l').components['leap-hand'].getHand())
                handTick = document.querySelector('#l').components['leap-hand'].getHand().pointables[0].tipPosition;
            break;
        default:
            //selezione della posizione del pollice sui tre assi
            if(hand.type === 'right' && document.querySelector('#r').components['leap-hand'].getHand() !== null && document.querySelector('#r').components['leap-hand'].getHand() !== undefined && document.querySelector('#r').components['leap-hand'].getHand())
                handTick = document.querySelector('#r').components['leap-hand'].getHand().pointables[0].tipPosition[i];
            else if(hand.type === 'left' && document.querySelector('#l').components['leap-hand'].getHand() !== null && document.querySelector('#l').components['leap-hand'].getHand() !== undefined && document.querySelector('#l').components['leap-hand'].getHand())
                handTick = document.querySelector('#l').components['leap-hand'].getHand().pointables[0].tipPosition[i];
    }
    return handTick;
};

var firstHandPosition = null; //posizione della mano nel momento in cui viene chiamato l'evento leap-holdstart
var flag = false; //indica se l'evento sia stato emesso o meno
var target = null; //oggetto da trasformare
var hand = null; //mano che innesca l'evento
var targetOriginalValue = null; //valore iniziale del target per somma posizione
var axis = null; //asse scelto per la modifica
var el = null; //variabile d'appoggio
var i = null; //indice asse
var oldTransformPosition = null;
var control = null;

/* vedere: getBoundingClientRect method */
AFRAME.registerComponent('holdable', {

    init: function ()
    {
        this.el.addEventListener('leap-holdstart', this.onHoldStart.bind(this));
        this.el.addEventListener('leap-holdstop', this.onHoldStop.bind(this));
        el = this.el;
    },

    tick: function()
    {
        target = targetObject;
        if(flag)
        {
            var handTick = null; //posizione del pollice nel tick corrente
            //controllo sull'asse selezionato: tutti, x, y, z
            if(axis === 'all')
                i = 3;
            else if(axis === 'x')
                i = 0;
            else if(axis === 'y')
                i = 1;
            else if(axis === 'z')
                i = 2;

            if(i !== null) {
                //selezione posizione mano in base all'asse
                handTick = selectHand(i);

                if(handTick !== null)
                {
                    //modifica della scalatura in base all'asse scelto (differenza tra posizione pollice in holdstart e ad ogni tick)
                    switch (i)
                    {
                        case 0:
                            if(control === 'translate') {
                                target.setAttribute('position', (targetOriginalValue.x + (handTick - firstHandPosition[i])) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);
                                //spostamento assi assieme all'oggetto target
                                document.querySelector('#transform').setAttribute('position', (oldTransformPosition.x + ((handTick - firstHandPosition[i])) + ' ' + oldTransformPosition.y + ' ' + oldTransformPosition.z));
                            }
                            else if(control === 'scale') {
                                target.setAttribute('scale', (targetOriginalValue.x + (handTick - firstHandPosition[i])) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);
                            }
                            else if(control === 'rotate') {
                                if(selectHand(1) !== null) {
                                    handTick = selectHand(1);
                                    target.setAttribute('rotation', (targetOriginalValue.x + ((handTick - firstHandPosition[1]) * 360)) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);

                                } else
                                //emette l'evento stop perché la mano non è più visibile
                                    el.emit('leap-holdstop');
                            }
                            break;
                        case 1:
                            if(control === 'translate') {
                                target.setAttribute('position', targetOriginalValue.x + ' ' + (targetOriginalValue.y + (handTick - firstHandPosition[i])) + ' ' + targetOriginalValue.z);
                                document.querySelector('#transform').setAttribute('position', oldTransformPosition.x + ' ' + (oldTransformPosition.y + (handTick - firstHandPosition[i])) + ' ' + oldTransformPosition.z);
                            } else if(control === 'scale') {
                                target.setAttribute('scale', targetOriginalValue.x + ' ' + (targetOriginalValue.y + (handTick - firstHandPosition[i])) + ' ' + targetOriginalValue.z);
                            } else if(control === 'rotate') {
                                if(selectHand(0) !== null) {
                                    handTick = selectHand(0);
                                    target.setAttribute('rotation', targetOriginalValue.x + ' ' + (targetOriginalValue.y + ((handTick - firstHandPosition[0]) * 360)) + ' ' + targetOriginalValue.z);
                                } else
                                //emette l'evento stop perché la mano non è più visibile
                                    el.emit('leap-holdstop');
                            }
                            break;
                        case 2:
                            if(control === 'translate') {
                                target.setAttribute('position', targetOriginalValue.x + ' ' + targetOriginalValue.y + ' ' + (targetOriginalValue.z + (handTick - firstHandPosition[i])));
                                document.querySelector('#transform').setAttribute('position', oldTransformPosition.x + ' ' + oldTransformPosition.y + ' ' + (oldTransformPosition.z + (handTick - firstHandPosition[i])));
                            } else if(control === 'scale') {
                                target.setAttribute('scale', targetOriginalValue.x + ' ' +  targetOriginalValue.y + ' ' + (targetOriginalValue.z + (handTick - firstHandPosition[i])));
                            } else if(control === 'rotate') {
                                if(selectHand(1) !== null && selectHand(0) !== null) {
                                    handTick0 = selectHand(0);
                                    handTick1 = selectHand(1);
                                    target.setAttribute('rotation', targetOriginalValue.x + ' ' + targetOriginalValue.y + ' ' + (targetOriginalValue.z + ((handTick0 - firstHandPosition[0] + handTick1 - firstHandPosition[1]) * 180)));
                                } else
                                //emette l'evento stop perché la mano non è più visibile
                                    el.emit('leap-holdstop');
                            }
                            break;
                        case 3:
                            if(control === 'translate') {
                                target.setAttribute('position', (targetOriginalValue.x + (handTick[0] - firstHandPosition[0])) + ' ' + (targetOriginalValue.y + (handTick[1] - firstHandPosition[1])) + ' ' + (targetOriginalValue.z + (handTick[2] - firstHandPosition[2])));
                                document.querySelector('#transform').setAttribute('position', (oldTransformPosition.x + (handTick[0] - firstHandPosition[0])) + ' ' + (oldTransformPosition.y + (handTick[1] - firstHandPosition[1])) + ' ' + (oldTransformPosition.z + (handTick[2] - firstHandPosition[2])));
                            } else if(control === 'scale') {
                                target.setAttribute('scale', (targetOriginalValue.x + (handTick[0] - firstHandPosition[0])) + ' ' + (targetOriginalValue.y + (handTick[1] - firstHandPosition[1])) + ' ' + (targetOriginalValue.z + (handTick[2] - firstHandPosition[2])));
                            } else if(control === 'rotate') {
                                if(selectHand(3) !== null) {
                                    handTick = selectHand(3);
                                    target.setAttribute('rotation', (targetOriginalValue.x + ((handTick[1] - firstHandPosition[1]) * 360)) + ' ' + (targetOriginalValue.y + ((handTick[0] - firstHandPosition[0]) * 360)) + ' ' + (targetOriginalValue.z + ((handTick[0] - firstHandPosition[0] + handTick[1] - firstHandPosition[1]) * 180)));
                                } else
                                //emette l'evento stop perché la mano non è più visibile
                                    el.emit('leap-holdstop');
                            }
                            break;
                    }
                }
                else
                //emette l'evento stop perché la mano non è più visibile
                    el.emit('leap-holdstop');
            }
        }
        else
            targetOriginalValue = i = hand = target = null;
    },

    onHoldStart: function (e)
    {
        axis = e.srcElement.id;
        if(e.detail.hand !== null && e.detail !== undefined && e.detail.hand)
        {
            //assegnamento mano che innescato l'evento
            hand = e.detail.hand;
            firstHandPosition = e.detail.hand.pointables[0].tipPosition;
            //assegnato target dallo script componente
            flag = true;
            //salvataggio colore precedente
            oldColor = document.querySelector('#' + axis).getAttribute('color');
            document.querySelector('#' + axis).setAttribute('color', '#ffff00');
            //salvataggio posizione precedente
            if(control === 'translate')
            {
                targetOriginalValue = target.getAttribute('position');
                oldTransformPosition = document.querySelector('#transform').getAttribute('position');
            }
            else if(control === 'scale')
                targetOriginalValue = target.getAttribute('scale');
            else if(control === 'rotation')
                targetOriginalValue = target.getAttribute('rotation');
        }
    },

    onHoldStop: function (e)
    {
        //l'evento emesso è stato "stoppato"
        flag = false;
        //assegnamento colore precedente
        document.querySelector('#' + axis).setAttribute('color', oldColor);
    }
});
