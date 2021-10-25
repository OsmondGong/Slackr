import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";


// user info
let TOKEN = null;
let USERID = null;
let USEREMAIL = null;
let USERNAME = null;
let USERBIO = null;
let USERIMAGE = null;
let USERPASSWORD = null;

// loading message
let isLoadingMessages = false;
const loadingMessages = document.createElement("div");
loadingMessages.innerText = "Fetching messages...";

// message container
let wrapper = document.getElementById("messages-container");
const profilePopup = document.getElementById("my-profile-popup");

// stores current user's detail
const storeUserDetails = (data, userData) => {
    TOKEN = data.token;
    USERID = data.userId;
    USEREMAIL = userData.email;
    USERNAME = userData.name;
    USERBIO = userData.bio;
    USERIMAGE = userData.image;
};

// background tint
const backgroundTint = document.getElementById("background-tint");

// button colour change on hover
let buttons = [].slice.call(document.getElementsByClassName("button"));
buttons.forEach(function (element){
    element.addEventListener("mouseover", () => {
        element.style["background-color"] = "lightcoral";
    });
    element.addEventListener("mouseout", () => {
        element.style["background-color"]  = "initial";
    });
});

// parses all fetch requests. Code obtained from Hayden's Assignment video 2.
const slackFetch = (method, path, body, token) => {
    const requestOptions = {
        method: method,
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(body),
    }

    if (token !== null) {
        requestOptions.headers["Authorization"] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        fetch(`http://localhost:5005${path}`, requestOptions)
        .then((response) => {
            if (response.status === 200) {
                response.json().then(data => {
                    resolve(data);
                })
            } else {
                response.json().then(errorMsg => {
                    reject(errorMsg["error"]);
                })
            }
        })
        .catch((err) => console.log(err));
    });
};

// Login
// clicking login nav on home page
document.getElementById("login-toggle").addEventListener("click", () => {
    document.getElementById("login-page").style.display = "block";
    document.getElementById("register-toggle").style.fontWeight = "normal";
    document.getElementById("login-toggle").style.fontWeight = "bold";
    document.getElementById("register-page").style.display = "none";
});

// clicking login button on home page
document.getElementById("login-button").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // login request
    slackFetch("Post", "/auth/login", {
        email: email,
        password: password,
    }, null)
    .then(data => {
        // user info request
        slackFetch("GET", `/user/${data.userId}`, undefined, data.token)
        .then((userData) => {
            USERPASSWORD = password;
            storeUserDetails(data, userData);
            openChannelPage();
        })
        .catch((err) => displayError(err));
    })
    .catch((err) => displayError(err));
});

// Register
// clicking register nav on home page
document.getElementById("register-toggle").addEventListener("click", () => {
    document.getElementById("register-page").style.display = "block";
    document.getElementById("login-toggle").style.fontWeight = "normal";
    document.getElementById("register-toggle").style.fontWeight = "bold";
    document.getElementById("login-page").style.display = "none";
});

// clicking register button
document.getElementById("register-button").addEventListener("click", () => {
    const email = document.getElementById("register-email").value;
    const name = document.getElementById("register-name").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-register-password").value;

    // verifies password
    if (password !== confirmPassword) {
        displayError("Passwords do not match");
        throw "Passwords do not match";
    }

    // register request
    slackFetch("Post", "/auth/register", {
        email: email,
        password: password,
        name: name,
    }, null)
    .then(data => {
        // sets default user image and bio
        slackFetch("PUT", "/user", {
            "email": "",
            "password": password,
            "name": name,
            "bio": "Hi! I have recently joined Slackr! :)",
            "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0QDQ0NDg0QDw4QDQ4NDQ4\
                        NDRsOEA4OFREWFxURFRUYIiggGBolGxUTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NDw0NDysZFRk\
                        rKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOYA2wM\
                        BIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQQFAwIH/8QALxABAAEBBwIEBgIDAQAAAAAAAAE\
                        CAwQREjFRkSFBBTJhcSKBobHB0UJyI1KCFP/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAA\
                        AAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+qAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
                        AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACJnDXp7gkV673RHfH2hz/8AdT/rILg\
                        qRfqNp+7rReaJ/lz0B2ERKQAAAAAAAAAAAAAAAAAAEChfLxMzNET07+oOltfYjpTGPr2U7S0qq1nH7PI\
                        oAAAA7WF4mjSImO8NCxtqaoxj5xOsMl6s65pmJhBsDzRVjETHeMXoAAAAAAAAAAAAAAAAHi0ry0zM9oZ\
                        DQ8Qq+DDeqP2zwAFAAAAAAGlcasaI9Oiwp+HeWr+34W0EgAAAAAAAAAAAAAAAp+I+Wn+0/ZRX/EY+Gn+\
                        34UAAFAAAAAAFzw6fNHtK8oeHa1+0fdfQAAAAAAAAAAAAAAAAUb/a/wAMNpx/SmsX+Pj/AOY/KuAAoAA\
                        AAAAsXK1y1ZcPNMRjs0WXdY/yUe7UQSAAAAAAAAAAAAAAACj4jT5Z96Z+6m1LzY56cMcJicYZtpRNMzT\
                        OsA8gKAAAAAERjMRv0BYuFONeO0TPPRpK91u80Y4z1nDRYQAAAAAAAAAAAAAAAAGdf6cK8d4+rRcL3Y5\
                        qemsdY9fQGYAoAAAAO1zpxtI9Oriv3GywjNOs6eyC2AAAAAAAAAAAAAAAAAAhKAZd7iItKvlP0cnW9Tj\
                        aVe+HEYOSgAAAA2aY6QxWzROMRO8RP0QegAAAAAAAAAAAAAAAAc7W1pp1n5dwerSuKYmZ0hQtb5VPl6R\
                        9UXi9zVExEYR33lXAAUAAAAHaxvNdPTWNpcQGpYW8Vx06Yaw7Mqwt5o06xOsSvWV5oq74TtKDuAAAAAA\
                        AAAAhyt7xTT6ztClaXuue+EbQDRqqiNZw93C0vlEafF7ftnTMzrOPuAsWl8rnT4Y9NeVeZBQAAAAAAAA\
                        AAAB1srzXTpOMbT1WrO/Uz5omn6woCDXptKZ0mJ+b2xXSi3rjSr5T1BrCrYXuKulXSd+0rIJAAcbza5a\
                        ce+kOzPv+M1RGE4RG24KszMzjOveROWdp4Ms7TwogTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTln\
                        aeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08A\
                        heuNtj8M6xpO8KWSdp4e7DGK6ZwnWOyDWAAAAAAAAAAAAAAAAAAAAAAAAAAABCQB//9k="
        }, data.token)
        .catch(err => displayError(err));
        displayError("Congrats on registering :D");
    })
    .catch((err) => displayError(err));
});

// function opens error popup
const displayError = (err) => {
    document.getElementById("error-text").innerText = err;
    document.getElementById("error-popup").style.display = "block";
    backgroundTint.style.display = "block";
};

// button to close error popup
document.getElementById("close-error-popup").addEventListener("click", () => {
    document.getElementById("error-popup").style.display = "none";
    backgroundTint.style.display = "none"
});

// join channel popup
let joinChannelId = null;
const joinChannelPopup = (channelId, channelData) => {
    joinChannelId = channelId;
    document.getElementById("join-channel-popup").style.display = "block";
    document.getElementById("join-channel-name").innerText = channelData.name;
}

// confirm joining channel
document.getElementById("confirm-join-button").addEventListener("click", () => {
    const myChannelPage = document.getElementById("my-channels-page");
    const joinablePage = document.getElementById("joinable-page");
    // join channel request
    slackFetch("POST", `/channel/${joinChannelId}/join`, undefined, TOKEN)
    .then(() => {
        // removes channel row from joinable channels page
        joinablePage.removeChild(document.getElementById("c-" + joinChannelId));
        // creates row in my channels page
        getChannelAndCreateChannelRow(joinChannelId, myChannelPage);
    })
    .catch((err) => displayError(err));
    // close popup
    document.getElementById("join-channel-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// cancel join channel
document.getElementById("cancel-join-button").addEventListener("click", () => {
    // close popup
    document.getElementById("join-channel-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// close button for join channel popup
document.getElementById("close-join-popup").addEventListener("click", () => {
    document.getElementById("join-channel-popup").style.display = "none";
    backgroundTint.style.display = "none";
});


let curChannelId = null;
// single channel page
const openSingleChannel = (channelId, channelData) => {
    // switch pages
    document.getElementById("single-channel-page").style.display = "block";
    document.getElementById("single-channel-name").innerText = channelData.name;
    document.getElementById("channel-selection-page").style.display = "none";
    // get 25 latest messages
    nextMessages(channelId, 0);
}

// show next 25 messages starting from start index
let lastIndex = 0;
const nextMessages = (channelId, start) => {
    let messageDatas = null;
    // get message request
    slackFetch("GET", `/message/${channelId}?start=${start}`, undefined, TOKEN)
    .then((messageData) => {
        messageDatas = messageData;
        curChannelId = channelId;
        const promiseList = [];
        lastIndex += messageData.messages.length;
        // promise list for messages to be in order
        for (let i = 0; i < messageData.messages.length; i++) {
            promiseList.push(slackFetch("GET", `/user/${messageData.messages[i].sender}`, undefined, TOKEN));
        }
        return Promise.all(promiseList);
    })
    .then((userData) => {
        const messagesContainer = document.getElementById("messages-container");
        // removes loading message div after message fetch requests (infinite scroll)
        if (isLoadingMessages) {
            messagesContainer.removeChild(loadingMessages);
            isLoadingMessages = false;
        }
        // create message container for each message and add to message container
        for (let i = 0; i < messageDatas.messages.length; i++) {
            newMessageContainer(messageDatas.messages[i], userData[i], true, document.getElementById("messages-container"));
        }
    })
    .catch((err) => displayError(err));
}

// Channel Creation functions
const getChannelAndCreateChannelRow = (channelId, page) => {
    // get request for channel detail
    slackFetch("GET", `/channel/${channelId}`, undefined, TOKEN)
    .then(channelData => {
        // get request for channel owner details
        slackFetch("GET", `/user/${channelData.creator}`,undefined, TOKEN)
        .then((userData) => {
            // create channel row
            createChannelRow(channelId, channelData, userData, page);
            document.getElementById("create-channel-name").value = "";
            document.getElementById("create-is-private").checked = false;
            document.getElementById("create-channel-description").value = "";
        })
        .catch((err) => displayError(err));
    })
    .catch((err) => displayError(err));
}

// creates channel div from template
const createChannelRow = (channelId, channelData, userData, page) => {
    const newRow = document.getElementById("channel-row-template").cloneNode(true);

    newRow.style.display = "block";
    newRow.id = "c-" + channelData.id;

    newRow.children[0].children[0].innerText = channelId;
    newRow.children[0].children[1].innerText = channelData.name;
    newRow.children[0].children[2].children[0].src = userData.image;
    newRow.children[0].children[2].children[1].innerText = userData.name;

    // sets colour if public/private
    if(channelData.private) {
        newRow.style["background-color"] = "#FCC66E";
    } else {
        newRow.style["background-color"] = "#9E9E9E";
    }

    // add when channel row is clicked
    newRow.addEventListener("click", () => {
        // join channel popup if on joinable channel page
        if (page.id === "joinable-page") {
            joinChannelPopup(channelId, channelData);
        }
        // else open the channel page
        else {
            openSingleChannel(channelId, channelData);
        }
    });
    // add the row to the page
    page.appendChild(newRow);
}

// opens create channel popup
document.getElementById("create-channel").addEventListener("click", () => {
    document.getElementById("create-channel-popup").style.display = "block";
    backgroundTint.style.display = "block";
})

// switch to joinable channel page
document.getElementById("joinable-channels").addEventListener("click", () => {
    document.getElementById("my-channels").style.fontWeight = "normal";
    document.getElementById("joinable-channels").style.fontWeight = "bold";
    document.getElementById("joinable-page").style.display = "block";
    document.getElementById("my-channels-page").style.display = "none";
})

// switch to my channels page
document.getElementById("my-channels").addEventListener("click", () => {
    document.getElementById("joinable-channels").style.fontWeight = "normal";
    document.getElementById("my-channels").style.fontWeight = "bold";
    document.getElementById("my-channels-page").style.display = "block";
    document.getElementById("joinable-page").style.display = "none";
})

// channel creation popup
document.getElementById("create-button").addEventListener("click", () => {
    const channelName = document.getElementById("create-channel-name").value;
    const channelDescription = document.getElementById("create-channel-description").value;
    
    // if channel is provided no name, display error
    if (channelName === "") {
        displayError("Please enter a valid name");
        return;
    }

    // post request for channel creation
    slackFetch("POST", "/channel", {
      "name": channelName,
      "private": document.getElementById("create-is-private").checked,
      "description": channelDescription
    }, TOKEN)
    .then((channel) => {
        const myChannelPage = document.getElementById("my-channels-page");

        backgroundTint.style.display = "none";
        document.getElementById("create-channel-popup").style.display = "none";
        // create channel row on my channel page
        getChannelAndCreateChannelRow(channel.channelId, myChannelPage);

        document.getElementById("create-channel-name").value = "";
        document.getElementById("create-is-private").checked = false;
        document.getElementById("create-channel-description").value = "";
    })
})

// close create channel popup
document.getElementById("close-channel-popup").addEventListener("click", () => {
    document.getElementById("create-channel-name").value = "";
    document.getElementById("create-is-private").checked = false;
    document.getElementById("create-channel-description").value = "";
    document.getElementById("create-channel-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// opens my channel page
const openChannelPage = () => {
    let channelDatas = null;
    lastIndex = 0;
    isLoadingMessages = false;
    const myChannelPage = document.getElementById("my-channels-page");
    const joinablePage = document.getElementById("joinable-page");

    // get request for all channels
    slackFetch("GET", "/channel", undefined, TOKEN)
    .then(channelData => {
        // set profile details
        const profile = document.getElementById("my-profile");
        profile.children[0].src = USERIMAGE;
        profile.children[1].innerText = USERNAME;

        // show only my channel page
        channelDatas = channelData;
        document.getElementById("home-page").style.display = "none";
        document.getElementById("single-channel-page").style.display = "none";
        document.getElementById("channel-selection-page").style.display = "block";

        // clears pages
        myChannelPage.textContent = "";
        joinablePage.textContent = "";

        // loops through all channels 
        const promiseList = [];
        for (let i = 0; i < channelDatas.channels.length; i++) {
            const curChannel = channelDatas.channels[i];
            // if channel is private and does not have the current user, it should now be shown on any pages
            if (curChannel.private && !curChannel.members.includes(USERID)) { channelDatas.channels.splice(i, 1); i--; continue; }
            // fetch the creator of each channel
            promiseList.push(slackFetch("GET", `/user/${curChannel.creator}`, undefined, TOKEN));
        }
        return Promise.all(promiseList);
    })
    .then(userData => {
        for (let i = 0; i < channelDatas.channels.length; i++) {
            const curChannel = channelDatas.channels[i];
            // if the channel has the current user, it should appear on the my channel page and if it doesn't, 
            // it should appear on the joinable (since the previous if statement guarantees it would be public)
            if (curChannel.members.includes(USERID)) {
                createChannelRow(curChannel.id, curChannel, userData[i], myChannelPage);
            } else {
                createChannelRow(curChannel.id, curChannel, userData[i], joinablePage);
            }
        }
    })
    .catch((err) => displayError(err));
}

// Single Channel Page
// back to channels page button
document.getElementById("back-button").addEventListener("click", () => {
    document.getElementById("messages-container").innerHTML = "";
    openChannelPage();
});

// channel details popup
document.getElementById("channel-details-button").addEventListener("click", () => {
    // get request for the current opened channel
    slackFetch("GET", `/channel/${curChannelId}`, undefined, TOKEN)
    .then((channelData) => {
        document.getElementById("channel-details-name").value = channelData.name;
        document.getElementById("channel-details-description").value = channelData.description;
        document.getElementById("channel-details-private").checked = channelData.private;
        document.getElementById("channel-creation-date").innerText = channelData.createdAt.substring(0,9);
        document.getElementById("channel-owner").innerText = channelData.creator;
        document.getElementById("channel-details-popup").style.display = "block";
        backgroundTint.style.display = "block";
    })
    .catch(err => displayError(err));
});

let prevName = null;
let prevDescription = null;
//clicking edit channel details button, allows user to edit channel details
document.getElementById("edit-channel-details").addEventListener("click", () => {
    prevName = document.getElementById("channel-details-name").value;
    prevDescription = document.getElementById("channel-details-description").value;
    document.getElementById("channel-details-name").disabled = false;
    document.getElementById("channel-details-description").disabled = false;
    document.getElementById("edit-channel-details").style.display = "none";
    document.getElementById("close-channel-details").style.display = "none";
    document.getElementById("confirm-edit-details").style.display = "inline";
    document.getElementById("cancel-edit-details").style.display = "inline";
});

// close channel details popup
document.getElementById("close-channel-details-popup").addEventListener("click", () => {
    document.getElementById("channel-details-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// another close channel details popup because why not have a button as well :)
document.getElementById("close-channel-details").addEventListener("click", () => {
    document.getElementById("channel-details-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// Confirm Edit button
document.getElementById("confirm-edit-details").addEventListener("click", () => {
    const newChannelName = document.getElementById("channel-details-name").value;
    const newChannelDescription = document.getElementById("channel-details-description").value;
    document.getElementById("channel-details-private").checked;

    // send put request for editing channel details
    slackFetch("PUT", `/channel/${curChannelId}`, {
        "name":newChannelName,
        "description":newChannelDescription
    }, TOKEN)
    .then(() => {
        backgroundTint.style.display = "none";
        document.getElementById("channel-details-name").disabled = true;
        document.getElementById("channel-details-description").disabled = true;
        document.getElementById("edit-channel-details").style.display = "inline";
        document.getElementById("close-channel-details").style.display = "inline";
        document.getElementById("confirm-edit-details").style.display = "none";
        document.getElementById("cancel-edit-details").style.display = "none";
    })
    .catch(err => displayError(err));
});

// Cancel Edit button
document.getElementById("cancel-edit-details").addEventListener("click", () => {
    document.getElementById("channel-details-name").disabled = true;
    document.getElementById("channel-details-name").value = prevName;
    document.getElementById("channel-details-description").disabled = true;
    document.getElementById("channel-details-description").value = prevDescription;
    document.getElementById("edit-channel-details").style.display = "inline";
    document.getElementById("close-channel-details").style.display = "inline";
    document.getElementById("confirm-edit-details").style.display = "none";
    document.getElementById("cancel-edit-details").style.display = "none";
    backgroundTint.style.display = "none";
});

// Leave Channel Button
document.getElementById("leave-channel-button").addEventListener("click", () => {
    // leave channel request
    slackFetch("POST", `/channel/${curChannelId}/leave`, undefined, TOKEN)
    .then(() => {
        document.getElementById("channel-details-popup").style.display = "none";
        backgroundTint.style.display = "none";
        // goes back to my channel page
        openChannelPage();
    })
    .catch(err => displayError(err));
})

// Messaging Functions
// Send message on enter press down
document.getElementById("send-message-container").addEventListener("keydown", function(e) {
    // regex used to ensure message does not send whitespace
    if(e.code === "Enter" && /\S/.test(document.getElementById("send-message-container").value)) {
        sendMessage(document.getElementById("send-message-container").value);
    }
 });

 // clears send message text area upon enter key going back up
document.getElementById("send-message-container").addEventListener("keyup", function(e) {
    if(e.code === "Enter"){
        document.getElementById("send-message-container").value = "";
    }
});

// sends message
const sendMessage = (message, image) => {
    let body = null;
    // verifies if it is sending message/image
    if (message !== null) {
        body = {
            "message": message,
            "image": ""
        }
    } else {
        body = {
            "message": "",
            "image": image
        }
    }
    // post request to send message
    slackFetch("POST", `/message/${curChannelId}`, body, TOKEN)
    .then(() => {
        document.getElementById("messages-container").innerHTML = "";
        // reloads message container upon sending message
        nextMessages(curChannelId, 0);
    })
    .catch(err => displayError(err));
};

// creates message container
const newMessageContainer = (message, userData, append, container) => {
    const newMessage = document.getElementById("single-message-template").cloneNode(true);
    newMessage.style.display = "block";
    newMessage.id = "m-" + message.id;

    // if user has no image, show default profile picture
    if (userData.image === null) {
        // default profile pic
        newMessage.children[0].children[0].children[0].src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0QDQ0NDg0QDw4QDQ4NDQ4\
                                                    NDRsOEA4OFREWFxURFRUYIiggGBolGxUTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NDw0NDysZFRk\
                                                    rKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOYA2wM\
                                                    BIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQQFAwIH/8QALxABAAEBBwIEBgIDAQAAAAAAAAE\
                                                    CAwQREjFRkSFBBTJhcSKBobHB0UJyI1KCFP/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAA\
                                                    AAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+qAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
                                                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACJnDXp7gkV673RHfH2hz/8AdT/rILg\
                                                    qRfqNp+7rReaJ/lz0B2ERKQAAAAAAAAAAAAAAAAAAEChfLxMzNET07+oOltfYjpTGPr2U7S0qq1nH7PI\
                                                    oAAAA7WF4mjSImO8NCxtqaoxj5xOsMl6s65pmJhBsDzRVjETHeMXoAAAAAAAAAAAAAAAAHi0ry0zM9oZ\
                                                    DQ8Qq+DDeqP2zwAFAAAAAAGlcasaI9Oiwp+HeWr+34W0EgAAAAAAAAAAAAAAAp+I+Wn+0/ZRX/EY+Gn+\
                                                    34UAAFAAAAAAFzw6fNHtK8oeHa1+0fdfQAAAAAAAAAAAAAAAAUb/a/wAMNpx/SmsX+Pj/AOY/KuAAoAA\
                                                    AAAAsXK1y1ZcPNMRjs0WXdY/yUe7UQSAAAAAAAAAAAAAAACj4jT5Z96Z+6m1LzY56cMcJicYZtpRNMzT\
                                                    OsA8gKAAAAAERjMRv0BYuFONeO0TPPRpK91u80Y4z1nDRYQAAAAAAAAAAAAAAAAGdf6cK8d4+rRcL3Y5\
                                                    qemsdY9fQGYAoAAAAO1zpxtI9Oriv3GywjNOs6eyC2AAAAAAAAAAAAAAAAAAhKAZd7iItKvlP0cnW9Tj\
                                                    aVe+HEYOSgAAAA2aY6QxWzROMRO8RP0QegAAAAAAAAAAAAAAAAc7W1pp1n5dwerSuKYmZ0hQtb5VPl6R\
                                                    9UXi9zVExEYR33lXAAUAAAAHaxvNdPTWNpcQGpYW8Vx06Yaw7Mqwt5o06xOsSvWV5oq74TtKDuAAAAAA\
                                                    AAAAhyt7xTT6ztClaXuue+EbQDRqqiNZw93C0vlEafF7ftnTMzrOPuAsWl8rnT4Y9NeVeZBQAAAAAAAA\
                                                    AAAB1srzXTpOMbT1WrO/Uz5omn6woCDXptKZ0mJ+b2xXSi3rjSr5T1BrCrYXuKulXSd+0rIJAAcbza5a\
                                                    ce+kOzPv+M1RGE4RG24KszMzjOveROWdp4Ms7TwogTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTln\
                                                    aeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08A\
                                                    heuNtj8M6xpO8KWSdp4e7DGK6ZwnWOyDWAAAAAAAAAAAAAAAAAAAAAAAAAAABCQB//9k="
    } else {
        // show user's profile picture
        newMessage.children[0].children[0].children[0].src = userData.image;
    }
    newMessage.children[0].children[0].children[1].innerText = userData.name;

    // get message sent time
    let time = new Date(message.sentAt);
    newMessage.children[0].children[0].children[3].innerText = time.toLocaleTimeString(undefined, { hour12: true }) + " " + time.toLocaleDateString();

    // if message has been edited, show edited time
    if (message.edited) {
        newMessage.children[0].children[0].children[4].style.display = "inline";
        let time = new Date(message.editedAt);
        newMessage.children[0].children[0].children[5].innerText = time.toLocaleTimeString(undefined, { hour12: true }) + " " + time.toLocaleDateString();
    }

    // determines if sending message or image
    if (message.message !== "") {
        newMessage.children[1].children[0].innerText = message.message;
    } else {
        newMessage.children[1].children[2].src = message.image;
    }

    // shows delete and edit buttons if message is sent by current user
    if (message.sender === USERID) {
        newMessage.children[2].children[0].style.display = "block";
        newMessage.children[2].children[1].style.display = "block";
    }
    
    // counts amount of reacts on message
    for(let i = 0; i < message.reacts.length; i++) {
        // blue background if current user reacted to it
        if (USERID === message.reacts[i].user) {
            newMessage.children[3].children[message.reacts[i].react].style.backgroundColor = "lightblue";
        }
        const count = Number(newMessage.children[3].children[message.reacts[i].react].children[0].innerText) + 1;
        newMessage.children[3].children[message.reacts[i].react].children[0].innerText = count;
    }
    
    // if the container pinned message container, do not give option to react
    if (container !== document.getElementById("pinned-messages-container")) {
        // give option to react on click
        for(let i = 0; i < newMessage.children[3].children.length; i++) {
            newMessage.children[3].children[i].addEventListener("click", () => {
                // if reacted and clicked, unreact. Else, react.
                if (newMessage.children[3].children[i].style.backgroundColor === "lightblue") {
                    // unreact request
                    slackFetch("POST", `/message/unreact/${curChannelId}/${message.id}`, {
                        "react": i
                    }, TOKEN)
                    .then(() => {
                        // change count and colour
                        const count = Number(newMessage.children[3].children[i].children[0].innerText) - 1;
                        newMessage.children[3].children[i].style.backgroundColor = "darkgray";
                        newMessage.children[3].children[i].children[0].innerText = count;
                    })
                    .catch(err => displayError(err));
                } else {
                    // react request
                    slackFetch("POST", `/message/react/${curChannelId}/${message.id}`, {
                        "react": i
                    }, TOKEN)
                    .then(() => {
                        // change count and colour
                        const count = Number(newMessage.children[3].children[i].children[0].innerText) + 1;
                        newMessage.children[3].children[i].style.backgroundColor = "lightblue";
                        newMessage.children[3].children[i].children[0].innerText = count;
                    })
                    .catch(err => displayError(err));
                }
            })
        }
    }

    // click username/user image to open their profile
    newMessage.children[0].children[0].addEventListener("click", () => {
        const popup = document.getElementById("user-profile-popup");
        popup.style.display = "block";
        
        popup.children[0].children[0].children[0].innerText = userData.name;
        popup.children[0].children[1].children[0].innerText = userData.email;
        popup.children[0].children[2].children[0].innerText = userData.bio;
        popup.children[0].children[3].children[0].src = userData.image;
    })

    // if message is pinned, change colour of message
    if (message.pinned) {
        newMessage.children[1].style.backgroundColor = "darkcyan";
    }

    // show message options when hovering on message. Very cool :]
    newMessage.addEventListener("mouseover", () => {
        newMessage.children[0].children[1].style.display = "block";
    });
    // hide message options when not hovering on message. Also very cool :]
    newMessage.addEventListener("mouseout", () => {
        newMessage.children[0].children[1].style.display = "none";
    });
    // clicking message options will open up message option popup
    newMessage.children[0].children[1].addEventListener("click", () => {
        newMessage.children[2].style.display = "block";
    });
    // clicking on images that have been sent will enlarge the image in a modal
    newMessage.children[1].children[2].addEventListener("click", () => {
        openModal(newMessage.id);
    });
    // clicking edit message option
    newMessage.children[2].children[0].addEventListener("click", () => {
        const oldMessage = newMessage.children[1].children[0].textContent;
        // if there is no message, there must be an image!
        if (oldMessage === "") {
            // clicks a hidden upload image button
            newMessage.children[4].click();
        } else {
            // changes div to input allowing for editing
            newMessage.children[1].children[0].style.display = "none";
            newMessage.children[1].children[1].style.display = "block";
            newMessage.children[1].children[1].value = oldMessage;
            // once enter is pressed, the message is edited
            newMessage.children[1].children[1].addEventListener("keydown", function(e) {
                if (e.code === "Enter") {
                    // if the message is the same as the old message, don't send a request
                    if (newMessage.children[1].children[1].value === oldMessage) {
                        newMessage.children[1].children[0].style.display = "block";
                        newMessage.children[1].children[1].style.display = "none";
                    } else {
                        // send edit message request
                        slackFetch("PUT", `/message/${curChannelId}/${message.id}`, {
                            "message": newMessage.children[1].children[1].value,
                            "image": ""
                        }, TOKEN)
                        .then(() => {
                            newMessage.children[1].children[0].innerText= newMessage.children[1].children[1].value;
                            newMessage.children[1].children[0].style.display = "block";
                            newMessage.children[1].children[1].style.display = "none";
                        })
                        .catch(err => displayError(err));
                        // adds edit time to message
                        newMessage.children[0].children[0].children[4].style.display = "inline";
                        let time = new Date();
                        newMessage.children[0].children[0].children[5].innerText = time.toLocaleTimeString(undefined, { hour12: true }) + " " + time.toLocaleDateString();
                    }
                }
            });
            // closes message option popup
            newMessage.children[2].style.display = "none";
        };
    });
    // when the user uploads a new image, the message is edited
    newMessage.children[4].addEventListener("change", () => {
        // converts message into base64 and edit message
        getBase64(newMessage.children[4].files[0])
        .then(data => {
            newMessage.children[1].children[2].src = data;
            newMessage.children[4].files = null;
            slackFetch("PUT", `/message/${curChannelId}/${message.id}`, {
                "message": "",
                "image": "data"
            }, TOKEN)
            .catch(err => displayError(err));
        })
        .catch(err => displayError(err));
        // adds edit time to message
        newMessage.children[0].children[0].children[4].style.display = "inline";
        let time = new Date();
        newMessage.children[0].children[0].children[5].innerText = time.toLocaleTimeString(undefined, { hour12: true }) + " " + time.toLocaleDateString();
    });
    // delete message
    newMessage.children[2].children[1].addEventListener("click", () => {
        // send delete request
        slackFetch("DELETE", `/message/${curChannelId}/${message.id}`, undefined, TOKEN)
        .then(() => {
            // remove the message from message box
            newMessage.children[2].style.display = "none";
            document.getElementById("messages-container").removeChild(newMessage);
        })
        .catch(err => displayError(err));
    });
    // pin message
    newMessage.children[2].children[2].addEventListener("click", () => {
        // pinned messages are colour cahnged to darkcyan
        // if message has already been pinned, unpin it. Otherwise, pin it.
        if (newMessage.children[1].style.backgroundColor == "darkcyan") {
            // unpin message request
            slackFetch("POST", `/message/unpin/${curChannelId}/${message.id}`, undefined, TOKEN)
            .then(() => {
                newMessage.children[1].style.backgroundColor = "darkgray";
            })
            .catch(err => displayError(err));
        } else {
            // pin message request
            slackFetch("POST", `/message/pin/${curChannelId}/${message.id}`, undefined, TOKEN)
            .then(() => {
                newMessage.children[1].style.backgroundColor = "darkcyan";
            })
            .catch(err => displayError(err));
        }
    });
    // highlight buttons on hover
    for (let i = 0; i < 3; i++) {
        newMessage.children[2].children[i].addEventListener("mouseover", () => {
            newMessage.children[2].children[i].style.backgroundColor = "aqua";
        })
        newMessage.children[2].children[i].addEventListener("mouseout", () => {
            newMessage.children[2].children[i].style.backgroundColor = "initial";
        })
    }
    // append/prepend message to container
    if (append) {
        container.append(newMessage);
    } else {
        container.prepend(newMessage);
    }
};

// removes channel option popup/user profile popup when user clicks off it
window.addEventListener("click", ({ target }) => {
    const messageOption = target.closest(".message-options");
    const button = target.closest(".message-options-button");
    const userPopup = target.closest(".user-profile-popup");
    const user = target.closest(".user-name");
    const popup = document.getElementById("user-profile-popup");
    // removes channel option popup when user clicks off it
    if (messageOption === null && button === null) {
        [...document.getElementsByClassName("message-options")].forEach(m => {
            m.style.display = "none";
        })
    }
    // removes user profile popup when user clicks off it
    if (userPopup === null && user === null && popup.style.display === "block") {
        popup.children[0].children[0].children[0].innerText = "";
        popup.children[0].children[1].children[0].innerText = "";
        popup.children[0].children[2].children[0].innerText = "";
        popup.style.display = "none";
    }
});

// loads more messages when channel box is scrolled to certain height
wrapper.addEventListener("scroll", () => {
    if (!isLoadingMessages) {
        if (wrapper.scrollTop + wrapper.scrollHeight < 540) {
            // adds loading message while messages are being fetched
            isLoadingMessages = true;
            document.getElementById("messages-container").appendChild(loadingMessages);
            nextMessages(curChannelId, lastIndex);
        }
    }
});

// shows all pinned messages in channel
document.getElementById("pin-message-button").addEventListener("click", () => {
    const pinnedMessagesList = [];
    const pinnedContainer = document.getElementById("pinned-messages-container");

    document.getElementById("pinned-messages-container").innerHTML = "";
    document.getElementById("pinned-messages-popup").style.display = "block";
    backgroundTint.style.display = "block";
    
    // get all pinned messages in channel
    getAllPinnedMessages(0, pinnedMessagesList)
    .then(() => {
        // get message sender for all messages
        const promiseList = [];
        for (let i = 0; i < pinnedMessagesList.length; i++) {
            promiseList.push(slackFetch("GET", `/user/${pinnedMessagesList[i].sender}`, undefined, TOKEN));
        }
        return Promise.all(promiseList);
    })
    .then((userData) => {
        // create message containers and add to pinned container
        for (let i = 0; i < pinnedMessagesList.length; i++) {
            newMessageContainer(pinnedMessagesList[i], userData[i], true, pinnedContainer);
        }
    })
    .catch((err) => displayError(err));
})

// recursive function that returns all pinned messages
const getAllPinnedMessages = (start, pinnedMessages) => {
    return slackFetch("GET", `/message/${curChannelId}?start=${start}`, undefined, TOKEN)
    .then((messageData) => {
        // returns if no more messages
        if (messageData.messages.length === 0) {
            return;
        }
        // add all pinned messages in current batch
        for (let i = 0; i < messageData.messages.length; i++) {
            if (messageData.messages[i].pinned) {
                pinnedMessages.push(messageData.messages[i]);
            }
        }
        // next batch of messages
        start += 25;
        return getAllPinnedMessages(start, pinnedMessages);
    });
}

// close pinned messages popup
document.getElementById("close-pinned-messages-popup").addEventListener("click", () => {
    document.getElementById("pinned-messages-container").innerHTML = "";
    document.getElementById("pinned-messages-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// opens invite user popup
document.getElementById("invite-users-button").addEventListener("click", () => {
    document.getElementById("invite-users-container").innerHTML = "";
    document.getElementById("invite-users-popup").style.display = "block";
    backgroundTint.style.display = "block";
    
    // get channel details
    slackFetch("GET", `/channel/${curChannelId}`, undefined, TOKEN)
    .then((channelData) => {
        const usersListId = [];
        // get all existing users
        slackFetch("GET", "/user", undefined, TOKEN)
        .then((usersList) => {
            const promiseList = [];
            // store all users that are not in channel
            for (let i = 0; i < usersList.users.length; i++) {
                if (channelData.members.includes(usersList.users[i].id)) continue;
                usersListId.push(usersList.users[i].id);
                // get details of user not in channel
                promiseList.push(slackFetch("GET", `/user/${usersList.users[i].id}`, undefined, TOKEN))
            }
            return Promise.all(promiseList);
        })
        .then((users) => {
            // add corresponding userid to users
            for (let i = 0; i < users.length; i++) {
                users[i]["id"] = usersListId[i]
            }
            // sort users by name alphabetically
            users.sort((a,b) => { // code obtained from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort  
                let nameA = a.name.toUpperCase(); // ignore upper and lowercase
                let nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                
                // names must be equal
                return 0;
            });
            // create row for invite container for each user
            for (let i = 0; i < users.length; i++) {
                createInviteRow(users[i]);
            }
        })
        .catch(err => displayError(err));
    })
    .catch(err => displayError(err));
});

// creates row for invite container
const createInviteRow = (user) => {
    const userRow = document.getElementById("invite-user-template").cloneNode(true);
    userRow.id = "u-" + user.id;
    userRow.style.display = "block";
    // if user has no image, use default
    if (user.image === null) {
        userRow.children[0].src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0QDQ0NDg0QDw4QDQ4NDQ4\
                                    NDRsOEA4OFREWFxURFRUYIiggGBolGxUTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NDw0NDysZFRk\
                                    rKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOYA2wM\
                                    BIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQQFAwIH/8QALxABAAEBBwIEBgIDAQAAAAAAAAE\
                                    CAwQREjFRkSFBBTJhcSKBobHB0UJyI1KCFP/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAA\
                                    AAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+qAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
                                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACJnDXp7gkV673RHfH2hz/8AdT/rILg\
                                    qRfqNp+7rReaJ/lz0B2ERKQAAAAAAAAAAAAAAAAAAEChfLxMzNET07+oOltfYjpTGPr2U7S0qq1nH7PI\
                                    oAAAA7WF4mjSImO8NCxtqaoxj5xOsMl6s65pmJhBsDzRVjETHeMXoAAAAAAAAAAAAAAAAHi0ry0zM9oZ\
                                    DQ8Qq+DDeqP2zwAFAAAAAAGlcasaI9Oiwp+HeWr+34W0EgAAAAAAAAAAAAAAAp+I+Wn+0/ZRX/EY+Gn+\
                                    34UAAFAAAAAAFzw6fNHtK8oeHa1+0fdfQAAAAAAAAAAAAAAAAUb/a/wAMNpx/SmsX+Pj/AOY/KuAAoAA\
                                    AAAAsXK1y1ZcPNMRjs0WXdY/yUe7UQSAAAAAAAAAAAAAAACj4jT5Z96Z+6m1LzY56cMcJicYZtpRNMzT\
                                    OsA8gKAAAAAERjMRv0BYuFONeO0TPPRpK91u80Y4z1nDRYQAAAAAAAAAAAAAAAAGdf6cK8d4+rRcL3Y5\
                                    qemsdY9fQGYAoAAAAO1zpxtI9Oriv3GywjNOs6eyC2AAAAAAAAAAAAAAAAAAhKAZd7iItKvlP0cnW9Tj\
                                    aVe+HEYOSgAAAA2aY6QxWzROMRO8RP0QegAAAAAAAAAAAAAAAAc7W1pp1n5dwerSuKYmZ0hQtb5VPl6R\
                                    9UXi9zVExEYR33lXAAUAAAAHaxvNdPTWNpcQGpYW8Vx06Yaw7Mqwt5o06xOsSvWV5oq74TtKDuAAAAAA\
                                    AAAAhyt7xTT6ztClaXuue+EbQDRqqiNZw93C0vlEafF7ftnTMzrOPuAsWl8rnT4Y9NeVeZBQAAAAAAAA\
                                    AAAB1srzXTpOMbT1WrO/Uz5omn6woCDXptKZ0mJ+b2xXSi3rjSr5T1BrCrYXuKulXSd+0rIJAAcbza5a\
                                    ce+kOzPv+M1RGE4RG24KszMzjOveROWdp4Ms7TwogTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTln\
                                    aeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08AgTlnaeDLO08A\
                                    heuNtj8M6xpO8KWSdp4e7DGK6ZwnWOyDWAAAAAAAAAAAAAAAAAAAAAAAAAAABCQB//9k="
    } else {
        userRow.children[0].src = user.image;
    }
    userRow.children[1].innerText = user.name
    // when clicked, changes row colour to aqua indicating that the user is selected
    userRow.addEventListener("click", () => {
        userRow.style.backgroundColor = "aqua";
    })
    // add row to invite container
    document.getElementById("invite-users-container").appendChild(userRow);
}

// close invite users popup
document.getElementById("close-invite-users-popup").addEventListener("click", () => {
    document.getElementById("invite-users-container").innerHTML = "";
    document.getElementById("invite-users-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// confirm invites, adding all invited to channel
document.getElementById("confirm-invite-button").addEventListener("click", () => {
    const users = document.getElementsByClassName("invite-users");
    const inviteList = [];
    // if row is selected, invite user
    for(let i = 0; i < users.length; i++) {
        if (users[i].style.backgroundColor === "aqua") {
            inviteList.push(users[i].id.substring(2,));
        }
    }
    // send invite user request
    for(let i = 0; i < inviteList.length; i++) {
        slackFetch("POST", `/channel/${curChannelId}/invite`, {
            "userId":Number(inviteList[i])
        }, TOKEN)
        .catch(err => displayError(err));
    }
    document.getElementById("invite-users-container").innerHTML = "";
    document.getElementById("invite-users-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// cancel invitation button
document.getElementById("cancel-invite-button").addEventListener("click", () => {
    document.getElementById("invite-users-container").innerHTML = "";
    document.getElementById("invite-users-popup").style.display = "none";
    backgroundTint.style.display = "none";
});

// logout button
document.getElementById("logout-button").addEventListener("click", () => {
    slackFetch("POST", "/auth/logout", undefined, TOKEN)
    .then(() => {
        TOKEN = null;
        USERID = null;
        document.getElementById("home-page").style.display = "block";
        document.getElementById("single-channel-page").style.display = "none";
        document.getElementById("channel-selection-page").style.display = "none";
    })
    .catch(err => displayError(err));
})

// opens my profile popup
document.getElementById("my-profile").addEventListener("click", () => {
    profilePopup.style.display = "block";
    
    profilePopup.children[1].children[0].children[0].value = USERNAME;
    profilePopup.children[1].children[1].children[0].value = USEREMAIL;
    profilePopup.children[1].children[2].children[0].value = USERPASSWORD;
    profilePopup.children[1].children[3].children[1].value = USERBIO;
    profilePopup.children[1].children[4].children[0].src = USERIMAGE;
})

// edit my profile
document.getElementById("edit-profile-button").addEventListener("click", () => {
    // allows user input
    profilePopup.children[1].children[0].children[0].disabled = false;
    profilePopup.children[1].children[1].children[0].disabled = false;
    profilePopup.children[1].children[2].children[0].disabled = false;
    profilePopup.children[1].children[3].children[1].disabled = false;

    profilePopup.children[1].children[5].style.display = "none";
    profilePopup.children[1].children[6].style.display = "block";
    document.getElementById("show-upload").style.display = "block";
});

// when image is uploaded, change picture
document.getElementById("upload-profile-button").addEventListener("change", () => {
    getBase64(document.getElementById("upload-profile-button").files[0])
    .then(data => {
        profilePopup.children[1].children[4].children[0].src = data;
    })
    .catch(err => displayError(err));
});

// saves all changes to profile
document.getElementById("save-profile-button").addEventListener("click", () => {
    let email = profilePopup.children[1].children[1].children[0].value;
    let password = profilePopup.children[1].children[2].children[0].value;
    let name = profilePopup.children[1].children[0].children[0].value;
    let bio = profilePopup.children[1].children[3].children[1].value;
    let image = profilePopup.children[1].children[4].children[0].src;

    // checks for any changes
    if (USEREMAIL !== email || USERPASSWORD !== password || USERNAME !== name || USERBIO !== bio || USERIMAGE !== image) {
        // if email is the same, set email to empty string as backend sends error for duplicate email
        if (USEREMAIL === email) {
            email = "";
        }
        // send update profile request
        slackFetch("PUT", "/user", {
            "email": email,
            "password": password,
            "name": name,
            "bio": bio,
            "image": image
        }, TOKEN)
        .then(() => {
            USERNAME = name;
            USEREMAIL = email;
            USERPASSWORD = password;
            USERBIO = bio;
            USERIMAGE = image;
            openChannelPage();
        })
        .catch(err => displayError(err));
    }
    profilePopup.children[1].children[0].children[0].disabled = true;
    profilePopup.children[1].children[1].children[0].disabled = true;
    profilePopup.children[1].children[2].children[0].disabled = true;
    profilePopup.children[1].children[3].children[1].disabled = true;
    profilePopup.children[1].children[5].style.display = "block";
    profilePopup.children[1].children[6].style.display = "none";
    document.getElementById("show-upload").style.display = "none";
});

// cancel all profile changes and revert back to old profile
document.getElementById("cancel-profile-button").addEventListener("click", () => {
    profilePopup.children[1].children[0].children[0].value = USERNAME;
    profilePopup.children[1].children[1].children[0].value = USEREMAIL;
    profilePopup.children[1].children[2].children[0].value = USERPASSWORD;
    profilePopup.children[1].children[3].children[1].value = USERBIO;
    profilePopup.children[1].children[4].children[0].src = USERIMAGE;
    profilePopup.children[1].children[0].children[0].disabled = true;
    profilePopup.children[1].children[1].children[0].disabled = true;
    profilePopup.children[1].children[2].children[0].disabled = true;
    profilePopup.children[1].children[3].children[1].disabled = true;
    profilePopup.children[1].children[5].style.display = "block";
    profilePopup.children[1].children[6].style.display = "none";
    document.getElementById("show-upload").style.display = "none";
});

const passwordButton = document.getElementById("password-toggle");
// toggle to change password from hidden to shown
passwordButton.addEventListener("click", () => {
    if (passwordButton.innerText == "Hide") {
        passwordButton.innerText = "Show";
        profilePopup.children[1].children[2].children[0].type = "password";
    } else {
        passwordButton.innerText = "Hide";
        profilePopup.children[1].children[2].children[0].type = "text";
    }
});

// converts input image to base 64
const getBase64 = (file) => {  // code obtained from https://www.codegrepper.com/code-examples/javascript/convert+input+image+to+base64+javascript
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// close profile popup
document.getElementById("close-profile-popup").addEventListener("click", () => {
    profilePopup.style.display = "none";
    backgroundTint.style.display = "none";
});

// send image message
document.getElementById("send-image").addEventListener("change", () => {
    // convert to base64
    getBase64(document.getElementById("send-image").files[0])
    .then(data => {
        sendMessage(null, data);
        document.getElementById("send-image").files = null;
    })
    .catch(err => displayError(err));
});

let imageMessages = [];
let imageIndex = null;
// open image modal
const openModal = (messageId) => {
    imageMessages = []
    imageIndex = null;
    // get all image messages and get index of provided messageId
    getAllImageMessages(0, imageMessages)
    .then(() => {
        for (let i = 0; i < imageMessages.length; i++) {
            if (Number(messageId.substring(2,)) === imageMessages[i].id) {
                imageIndex = i;
                document.getElementById("modal-img").src = imageMessages[i].image;
                checkIndex(i);
                break;
            }
        }
        document.getElementById("modal-popup").style.display = "block";
        backgroundTint.style.display = "block";
    })
    .catch(err => displayError(err));
}

// go to next image using image array and index
document.getElementById("grid-left-button").addEventListener("click", () => {
    imageIndex--;
    imageMessages[imageIndex]
    document.getElementById("modal-img").src = imageMessages[imageIndex].image;
    checkIndex(imageIndex);
});

// go to previous image using image array and index
document.getElementById("grid-right-button").addEventListener("click", () => {
    imageIndex++;
    imageMessages[imageIndex]
    document.getElementById("modal-img").src = imageMessages[imageIndex].image;
    checkIndex(imageIndex);
});

// check if index is last index/first index and hide corresponding buttons.
const checkIndex = (i) => {
    document.getElementById("grid-right-button").style.display = "block";
    document.getElementById("grid-left-button").style.display = "block";
    if (i === imageMessages.length - 1) {
        document.getElementById("grid-right-button").style.display = "none";
    }
    if (i === 0) {
        document.getElementById("grid-left-button").style.display = "none";
    }
}

// get all image messages through recursion
const getAllImageMessages = (start, imageMessages) => {
    return slackFetch("GET", `/message/${curChannelId}?start=${start}`, undefined, TOKEN)
    .then((messageData) => {
        // return if no more messages
        if (messageData.messages.length === 0) {
            return;
        }
        // loop and get all image messages and push to array
        for (let i = 0; i < messageData.messages.length; i++) {
            if (messageData.messages[i].image !== "") {
                imageMessages.push(messageData.messages[i]);
            }
        }
        start += 25;
        return getAllImageMessages(start, imageMessages);
    });
}

// close modal popup
document.getElementById("close-modal-popup").addEventListener("click", () => {
    document.getElementById("modal-popup").style.display = "none";
    backgroundTint.style.display = "none";
})