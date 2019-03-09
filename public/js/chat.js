const chatForm = document.querySelector('#message-form');
const chatInput = chatForm.querySelector('input');
const locationButton = document.querySelector('#send-location');


const socket = io();

socket.on('message', (message) => {
   console.log(message);
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    chatForm.querySelector('button').setAttribute('disabled', 'disabled');
    socket.emit('chatMessage', message,  (ack) => {
        chatForm.querySelector('button').removeAttribute('disabled');
        chatInput.focus();
        console.log(ack);
    });
    e.target.elements.message.value = "";
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        socket.emit('sendLocation', {
            longitude,
            latitude
        }, () => {
            locationButton.removeAttribute('disabled');

            console.log('Location sent.')
        });
    })
});