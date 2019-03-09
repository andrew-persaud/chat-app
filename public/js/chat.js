const chatForm = document.querySelector('#message-form');
const locationButton = document.querySelector('#send-location');


const socket = io();

socket.on('message', (message) => {
   console.log(message);
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    socket.emit('chatMessage', message);
    e.target.elements.message.value = "";
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        socket.emit('sendLocation', {
            longitude,
            latitude
        });
    })
})