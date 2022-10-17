let currentUser;
let discussion;
let isWizzing = false;
const messagesList = document.querySelector("#messages");
const messageInput = document.querySelector("#message");
const smileyMenu = document.querySelector("#smiley-menu");

const defaultPicture =
  "https://images.unsplash.com/photo-1664638687239-2e6bfc32917f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=927&q=80";

(async () => {
  // Get user
  const userLocalData = window.localStorage.getItem("trymatchdevgirl");
  if (
    userLocalData &&
    typeof userLocalData !== "undefined" &&
    userLocalData !== "undefined"
  ) {
    currentUser = JSON.parse(userLocalData);
    // Display user data
    displayUserData(currentUser);

    // Get discussion id
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get discussion
    const discussionRes = await fetch(
      `http://localhost:8000/api/discussions/${urlParams.get("discussionId")}`
    );
    const discussionData = await discussionRes.json();
    discussion = discussionData.data;

    // Is user inside the discussion ?
    if (
      !discussion.UsersDiscussion.some(
        ({ userId }) => userId === currentUser.id
      )
    )
      window.location.replace("/discussions.html");

    // Get other user
    const contacts = discussion.UsersDiscussion.filter(
      ({ userId }) => userId !== currentUser.id
    );
    displayContactsData(contacts);

    // Display messages
    displayMessages(discussion.Messages);

    // Message form
    document
      .querySelector("#messages-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        if (messageInput.value && messageInput.value !== "") {
          // Add message
          const createMessageRes = await fetch(
            `http://localhost:8000/api/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUser.id,
                discussionId: urlParams.get("discussionId"),
                content: messageInput.value,
              }),
            }
          );
          const createMessageData = await createMessageRes.json();

          if (createMessageData.success) {
            displayMessage(createMessageData.data);
            // Reset input value
            messageInput.value = "";
          }
        }
      });

    // Log out button
    const logoutButton = document.querySelector("#logout");
    logoutButton.addEventListener("click", () => {
      window.localStorage.removeItem("trymatchdevgirl");
      window.location.replace("/");
    });

    // Smiley menu
    smiley.addEventListener("click", () => {
      if (smileyMenu.classList.contains("hidden")) {
        smileyMenu.classList.remove("hidden");
        smileyMenu.classList.add("flex");
      } else {
        smileyMenu.classList.add("hidden");
        smileyMenu.classList.remove("flex");
      }
    });

    // Emotes clicks
    document.querySelectorAll(".smiley-emote").forEach((emote) =>
      emote.addEventListener("click", () => {
        messageInput.value += `${emote.innerHTML.trim()}`;
      })
    );

    var audio = new Audio("/assets/MSN-wizz.mp3");
    document.querySelector("#wizz").addEventListener("click", () => {
      if (!isWizzing) {
        isWizzing = true;
        document.body.classList.add("wizz");

        if (audio.paused) {
          audio.play();
        } else {
          audio.currentTime = 0;
        }
      }
    });
    document.body.addEventListener("animationend", () => {
      document.body.classList.remove("wizz");
      isWizzing = false;
    });

    messageInput.addEventListener("input", () => {
      messageInput.value = messageInput.value.replace(
        /([^A-Z a-z\s&.0-9:•!?\ud83d\ude11]|(\ud83d(?!\ude11)))+/g,
        ""
      );
    });
  } else {
    window.location.replace("/");
  }
})();

function displayUserData(user) {
  const name = document.querySelector("#name");
  if (name) {
    name.innerHTML = user.name;
  }

  const picture = document.querySelector("#picture");
  if (picture) {
    picture.src = user.picture ?? defaultPicture;
  }
}

function displayContactsData(contacts) {
  contacts.forEach(({ user }) => {
    const titleName = document.querySelector("#discussion-user");
    if (titleName) titleName.innerHTML = user.name;

    const link = document.querySelector("#link-user");
    if (link) link.href = `/user/index.html?userId=${user.id}`;
  });
}

function displayMessages(messages) {
  messages.forEach((message) => displayMessage(message));
}

function displayMessage(message) {
  if (message.userId === currentUser.id) {
    messagesList.innerHTML += `
            <li
              class="p-2 bg-blue-500 text-white inline-block max-w-[50%] shadow-md rounded-md mb-2 self-end"
            >
              ${message.content}
            </li>
          `;
  } else {
    messagesList.innerHTML += `
            <li
              class="p-2 bg-white inline-block max-w-[50%] shadow-md rounded-md mb-2"
            >
              ${message.content}
            </li>
          `;
  }
}
