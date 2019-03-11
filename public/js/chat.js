

const socket = io();

const $chatForm = document.querySelector('#message-form');
const $chatInput = $chatForm.querySelector('input');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $users = document.querySelector('#render-users');



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML //get the html in the template script
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); //parse query string to get username and room

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom); //Reading as 0. Don't know why.
    const newMessageHeight = $newMessage.offsetHeight + 16;
 

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }


  
}
//on
socket.on('message', ({username, message, createdAt}) => {
   const html = Mustache.render(messageTemplate, {
       username,
       message,
       createdAt : moment(createdAt).format('h:mm a')
   }); 
   $messages.insertAdjacentHTML('beforeend', html); //insert template html into message div 
   autoscroll();
});

socket.on('locationMessage', ({username, url, createdAt}) => {
    const html = Mustache.render(locationTemplate, {
        username,
        url,
        createdAt : moment(createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $users.insertAdjacentHTML('beforeend', html);

})


//emit
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href= '/'
    }
});







//events for emits

$chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    $chatForm.querySelector('button').setAttribute('disabled', 'disabled');
    socket.emit('chatMessage', message,  (ack) => {
        $chatForm.querySelector('button').removeAttribute('disabled');
        $chatInput.focus();
        console.log(ack);
    });
    e.target.elements.message.value = "";
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        socket.emit('sendLocation', {
            longitude,
            latitude
        }, () => {
            $locationButton.removeAttribute('disabled');

            console.log('Location sent.')
        });
    })
});