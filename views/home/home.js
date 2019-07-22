const gel = element => document.querySelector(element);

const userID = window.localStorage.getItem('userID');

const renderMessages = async (chatID) => {
  window.localStorage.setItem('chatID', chatID);

  const messages = (await axios.get(`/api/message/${chatID}`)).data;

  const messagesDiv = gel('#messages');
  messagesDiv.innerHTML = '';

  if (!messages) return;

  Object.entries(messages).forEach(([key, message]) => {
    messagesDiv.innerHTML += `
      <p class="message" message-id="${key}">${message.content}</p>
    `;
  });
};

const renderContacts = async () => {
  try {
    const contacts = (await axios.get(`/api/user/contact/${userID}`)).data;
    const contactsDiv = gel('#contacts');

    contactsDiv.innerHTML = '';

    Object.values(contacts).forEach((contact) => {
      contactsDiv.innerHTML += `
      <p class="contact" onclick="renderMessages('${btoa(contact.userID < userID ? `${contact.userID}(*-*)${userID}` : `${userID}(*-*)${contact.userID}`)}')">${contact.username}</p>
    `;
    });
  } catch (err) {
    console.log(err.response);
  }
};

gel('#add-contact-form').addEventListener('submit', async (e) => {
  try {
    e.preventDefault();

    await axios.post(`/api/user/contact/${userID}`, {
      contact: gel('input[name=contact]').value,
    });

    gel('input[name=contact]').value = '';
    renderContacts();
  } catch (err) {
    console.log(err.response);
  }
});

gel('#send-message-form').addEventListener('submit', async (e) => {
  try {
    e.preventDefault();

    const chatID = window.localStorage.getItem('chatID');
    await axios.post(`/api/message/${chatID}`, {
      message: gel('input[name=message]').value,
    });

    gel('input[name=message]').value = '';
    renderMessages(chatID);
  } catch (err) {
    console.log(err.response);
  }
});

setInterval(async () => {
  try {
    const response = await axios.get(`/api/user/has-message/${userID}`);
    const chatID = window.localStorage.getItem('chatID');
    const hasMessageIDs = [];

    const contactsNotSeen = Object.values(response.data)
      .map(NotificationChatID => atob(NotificationChatID))
      .join('(*-*)').split('(*-*)')
      .filter(id => id !== userID);

    console.log(contactsNotSeen);

    return;

    Object.entries(response.data).forEach(([hasMessageID, hasChatID]) => {
      if (hasChatID === chatID) hasMessageIDs.push(hasMessageID);
    });

    if (!hasMessageIDs.length) return;

    hasMessageIDs.forEach(async (hasMessageID) => {
      await axios.delete(`/api/user/has-message/${userID}/${hasMessageID}`);
    });

    renderMessages(chatID);
  } catch (err) {
    console.log(err.response);
    if (err.response.data === 'unauthenticated') window.location.replace('/login');
  }
}, 200);

renderContacts();
