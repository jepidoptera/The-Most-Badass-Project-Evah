
 alert('hello');

 if (window.sessionStorage) {
    //  Get form elements
    var txtUsername = document.getElementById('username'); 
    var txtEmail = document.getElementById('email');
    

    // Elements get populated by local storage data
    txtUsername.value = sessionStorage.getItem('username');
    txtEmail.value = sessionStorage.getItem('email');
    console.log('email')
    // Data saved
    txtUsername.addEventListener('input', function() {
        sessionStorage.setItem('username', txtUsername.value);
    }, false);

    txtEmail.addEventListener('input', function() {
        sessionStorage.setItem('email', txtEmail.value);
    }, false);
 }

