const url = new URL(window.location)
const artefact = url.searchParams.get('artefact')
const image = url.searchParams.get('image')

Object.keys(this.globalData.fields).forEach((field) => {
  const input = document.querySelector('template').content.cloneNode(true);
  input.querySelector('.label').innerHTML = field;
  input.querySelector('.input').value = this.globalData.fields[field];
  input.querySelector('.input').setAttribute('data-id', field)
  document.querySelector('.form-fields').appendChild(input);
})

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {}
  document.querySelectorAll('input.input').forEach((element) => {
    data[element.getAttribute('data-id')] = element.value;
  })

  console.log(data);
  
  fetch(`/${artefact}/${image}`, {method: 'POST', body: JSON.stringify(data), headers: {Authorization: globalData.apiKey}})
});