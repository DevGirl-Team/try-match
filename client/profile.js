let currentUser;
const form = document.querySelector("#form");
const formEmail = form.querySelector("#form-email");
const formName = form.querySelector("#form-name");
const formBio = form.querySelector("#form-bio");
const formPicture = form.querySelector("#form-picture");
const formImg = form.querySelector("#form-img");
let formPictureBase64;

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

    // Fill form
    fillForm(currentUser);

    // Event listener form file input
    formPicture.addEventListener("input", (evt) => {
      var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

      // FileReader support
      if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
          formPictureBase64 = fr.result;
          currentUser.picture = formPictureBase64;
          formImg.src = formPictureBase64;
        };
        fr.readAsDataURL(files[0]);
      }
    });

    // Event listener gallery input
    document
      .querySelector("#gallery-input")
      .addEventListener("input", (evt) => {
        var tgt = evt.target || window.event.srcElement,
          files = tgt.files;

        // FileReader support
        if (FileReader && files && files.length) {
          var fr = new FileReader();
          fr.onload = function () {
            formPictureBase64 = fr.result;
            // Save in DB
            if (!currentUser.galleryPicture1)
              currentUser.galleryPicture1 = formPictureBase64;
            else if (!currentUser.galleryPicture2)
              currentUser.galleryPicture2 = formPictureBase64;
            else if (!currentUser.galleryPicture3)
              currentUser.galleryPicture3 = formPictureBase64;
            updateUser();
          };
          fr.readAsDataURL(files[0]);
        }
      });

    // Event listener cat input
    document.querySelector("#cat-input").addEventListener("input", (evt) => {
      var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

      // FileReader support
      if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
          formPictureBase64 = fr.result;
          // Save in DB
          if (!currentUser.catPicture)
            currentUser.catPicture = formPictureBase64;
          updateUser();
        };
        fr.readAsDataURL(files[0]);
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateUser();
    });

    // Log out button
    const logoutButton = document.querySelector("#logout");
    logoutButton.addEventListener("click", () => {
      window.localStorage.removeItem("trymatchdevgirl");
      window.location.replace("/");
    });
  } else {
    window.location.replace("/");
  }
})();

function deleteGalleryPicture(num) {
  currentUser[`galleryPicture${num}`] = null;
  updateUser();
}
function deleteCatPicture() {
  currentUser.catPicture = null;
  updateUser();
}

function displayUserData(user) {
  const name = document.querySelector("#name");
  if (name) {
    name.innerHTML = user.name;
  }

  const picture = document.querySelector("#picture");
  if (picture) {
    picture.src = user.picture ?? defaultPicture;
  }

  // Gallery
  const galleryPicture1 = document.querySelector("#gallery-1");
  const galleryPicture2 = document.querySelector("#gallery-2");
  const galleryPicture3 = document.querySelector("#gallery-3");
  galleryPicture1.innerHTML = currentUser.galleryPicture1
    ? `<img src="${user.galleryPicture1}" class="w-full h-full object-contain" />
          <button onclick="deleteGalleryPicture(1)" class="bg-slate-100 w-full p-1 text-blue-500">Supprimer</button>`
    : "";
  galleryPicture2.innerHTML = currentUser.galleryPicture2
    ? `<img src="${user.galleryPicture2}" class="w-full h-full object-contain" />
          <button onclick="deleteGalleryPicture(2)" class="bg-slate-100 w-full p-1 text-blue-500">Supprimer</button>`
    : "";
  galleryPicture3.innerHTML = currentUser.galleryPicture3
    ? `<img src="${user.galleryPicture3}" class="w-full h-full object-contain" />
          <button onclick="deleteGalleryPicture(3)" class="bg-slate-100 w-full p-1 text-blue-500">Supprimer</button>`
    : "";

  // Remove add picture gallery input if already three pictures
  const galleryAddInput = document.querySelector("#gallery-add");
  if (
    currentUser.galleryPicture1 &&
    currentUser.galleryPicture2 &&
    currentUser.galleryPicture3
  ) {
    galleryAddInput.classList.add("hidden");
  } else galleryAddInput.classList.remove("hidden");

  // Cat picture
  const catPicture = document.querySelector("#cat-picture");
  catPicture.innerHTML = currentUser.catPicture
    ? `<img src="${user.catPicture}" class="w-full h-full object-contain" />
          <button onclick="console.log(deleteCatPicture())" class="bg-slate-100 w-full p-1 text-blue-500">Supprimer</button>`
    : "";

  // Remove add cat gallery input if already one picture
  const catAddInput = document.querySelector("#cat-add");
  if (currentUser.catPicture) {
    catAddInput.classList.add("hidden");
  } else catAddInput.classList.remove("hidden");
}

function fillForm(user) {
  formEmail.value = user.email;
  formName.value = user.name;
  formBio.value = user.bio;
  formImg.src = user.picture ?? defaultPicture;
}

async function updateUser() {
  // DB
  const editUserRes = await fetch(
    `http://localhost:8000/api/users/${currentUser.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formEmail.value,
        name: formName.value,
        bio: formBio.value,
        picture: currentUser.picture,
        galleryPicture1: currentUser.galleryPicture1,
        galleryPicture2: currentUser.galleryPicture2,
        galleryPicture3: currentUser.galleryPicture3,
        catPicture: currentUser.catPicture,
      }),
    }
  );
  const editUserData = await editUserRes.json();
  if (editUserData.success) {
    currentUser = editUserData.data;

    // Local
    window.localStorage.setItem("trymatchdevgirl", JSON.stringify(currentUser));

    // Update HTML
    displayUserData(currentUser);
  } else {
    console.error(editUserData);
  }
}
