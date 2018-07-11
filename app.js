window.addEventListener('load', function() {
    var content = document.querySelector('.content');
    var loadingSpinner = document.getElementById('loading');
    content.style.display = 'block';
    loadingSpinner.style.display = 'none';
    onlineOrder.style.display = 'none';
    
    var webAuth = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        redirectUri: AUTH0_CALLBACK_URL,
        audience: 'https://' + AUTH0_API_UNIQUE_ID,
        responseType: 'token id_token',
        scope: 'openid email access:orderonline',
        leeway: 60
    });

    var loginStatus = document.querySelector('.container h4');
    var loginView = document.getElementById('login-view');
    var homeView = document.getElementById('home-view');
    var onlineOrderView = document.getElementById('onlineOrder');
    var orderMenuView = document.getElementById('orderMenu');

    // buttons and event listeners
    var homeViewBtn = document.getElementById('btn-home-view');
    var loginBtn = document.getElementById('qsLoginBtn');
    var logoutBtn = document.getElementById('qsLogoutBtn');
    var orderBtn = document.getElementById('btn-order');

    homeViewBtn.addEventListener('click', function() {
        homeView.style.display = 'inline-block';
        //loginView.style.display = 'none';
    });

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        webAuth.authorize();
    });

    logoutBtn.addEventListener('click', logout);

    orderBtn.addEventListener('click', orderOnline);

    function setSession(authResult) {
        // Set the time that the access token will expire at
        var expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        console.log('access_token: ' + authResult.accessToken);
    }

    function logout() {
        // Remove tokens and expiry time from localStorage
        hasVerifiedEmail = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_email_verified');
        displayButtons();
        hideOrderForm();
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    function handleAuthentication() {
        webAuth.parseHash(function(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                setSession(authResult);
                loginBtn.style.display = 'none';
                homeView.style.display = 'inline-block';
                webAuth.client.userInfo(authResult.accessToken, function (err, user) {
                    //alert(user.email_verified);
                    localStorage.setItem('user_email', user.email);
                    localStorage.setItem('user_email_verified', user.email_verified);
                });
            } else if (err) {
                homeView.style.display = 'inline-block';
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    function displayButtons() {
        if (isAuthenticated()) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            onlineOrderView.style.display = 'inline-block';
            loginStatus.innerHTML = 'Online Orders Now Available for Verified Accounts!';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            onlineOrderView.style.display = 'none';
            loginStatus.innerHTML =
            'Welcome to Pizza 42!<br/><br/>Please login to continue.';
        }
    }

    function orderOnline() {

        console.log(localStorage.getItem("user_email_verified"));
        console.log(localStorage.getItem("user_email"));
        console.log(localStorage.getItem("user_email_verified") === "true" && (localStorage.getItem("user_email").length > 0));
        //getAppToken();
        if (localStorage.getItem("user_email_verified") === "true" && (localStorage.getItem("user_email").length > 0)) {

            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://localhost:3010/api/getmenu/",
                "method": "GET",
                "headers": {
                    "authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
        
            $.ajax(settings).done(function (response) {
                console.log(response);

                if (response.pizza != null && response.pizza.length >= 0) {
                    //display our menu
                    displayOrderForm();
                    orderMenuView.innerHTML = "<h3>Online Menu</h3>";
                    //parse our menu contents                    
                    for (var i = 0; i < response.pizza.length; i++) {
                        orderMenuView.innerHTML = orderMenuView.innerHTML +
                            "<button id='btn - order' class='btn btn - primary btn - margin'>" + response.pizza[i].name + " " +
                            response.pizza[i].cost + "</button ><br/><br/>";
                        console.log(response.pizza[i].name);
                        console.log(response.pizza[i].cost);
                    }
                }
            });
        }
        else {
            displayOrderForm();
            orderMenuView.innerHTML = "<h4> Please verify your email address</h4> If you didn't receive your account verification email, <br/>then please click <a href='#'>here</a> to resend it.";
            console.log("User doesn't have verified email.");
        }
    }

    function displayOrderForm() {
        orderMenuView.style.display = 'inline-block';
        orderStart.style.display = 'none';
    }

    function hideOrderForm() {
        orderMenuView.style.display = 'none';
        orderMenuView.innerHTML = "";
        orderStart.style.display = 'inline-block';
    }

    function getAppToken() {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3010/api/getAppToken/",
            "method": "POST",
            "headers": {
                "authorization": "Bearer " + localStorage.getItem('access_token')
            }
        }

        $.ajax(settings).done(function (response) {
            console.log("received app token");
            console.log(response);
          
        });
    }


    handleAuthentication();
});
