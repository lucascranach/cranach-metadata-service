const url = new URL(window.location);
const artefact = url.searchParams.get('artefact');
const image = url.searchParams.get('image');
const apiKey = url.searchParams.get('apiKey');

function notify() {
  document.querySelector('.message').classList.toggle('animate-in');
}

if (apiKey === null) {
  document.querySelector('button').setAttribute('disabled', true);
}

if (Object.keys(this.globalData.fields).length === 0) {
  document.querySelector('#createNewFileButton').classList.remove('hidden');
  document.querySelector('form').classList.add('hidden');
}

Object.keys(this.globalData.fields).forEach((field) => {
  const input = document.querySelector('template').content.cloneNode(true);
  input.querySelector('.label').innerHTML = field;
  input.querySelector('.input').value = this.globalData.fields[field];
  input.querySelector('.input').setAttribute('data-id', field);
  input.querySelector('.input').setAttribute('list', field);
  input.querySelector('datalist').setAttribute('id', field);
  const suggestions = this.globalData.suggestions[field];
  if (suggestions !== undefined && suggestions.length > 0) {
    suggestions.forEach((suggestion) => {
      const newOption = document.createElement('option');
      newOption.value = suggestion;
      input.querySelector('datalist').appendChild(newOption);
    });
  }
  document.querySelector('.form-fields').appendChild(input);
});

const getCurrentData = () => {
  const data = {};
  document.querySelectorAll('input.input').forEach((element) => {
    data[element.getAttribute('data-id')] = element.value;
  });
  return data;
};

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = getCurrentData();
  fetch(`${globalData.pathPrefix}/${artefact}/${image}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: apiKey },
  });
});

document.querySelector('#createNewFileButton').addEventListener(
  'click',
  async (_event) => {
    await fetch(`${globalData.pathPrefix}/${artefact}/${image}`, {
      method: 'PUT',
      headers: { Authorization: apiKey },
    });
    window.location.reload();
  },
);

document.querySelector('#copyButton').addEventListener(
  'click',
  async (_event) => {
    const data = getCurrentData();
    setClipboard(data);
  },
);

document.querySelector('#pasteButton').addEventListener(
  'click',
  async (_event) => {
    const data = await getClipboard();
    const json = JSON.parse(data);
    Object.keys(json).forEach((key) => {
      const input = document.querySelector(`input[data-id="${key}"]`);
      if (input !== null) input.value = json[key];
    });
  },
);

async function setClipboard(text) {
  await navigator.clipboard.writeText(JSON.stringify(text));
}

async function getClipboard() {
  try {
    const clipboarText = await navigator.clipboard.readText();
    return clipboarText;
  } catch (err) {
    console.error(err.name, err.message);
  }
}
