const url = new URL(window.location)
const artefact = url.searchParams.get('artefact')
const image = url.searchParams.get('image')
const apiKey = url.searchParams.get('apiKey')

if(apiKey === null) document.querySelector('button').setAttribute('disabled', true)

Object.keys(this.globalData.fields).forEach((field) => {
  const input = document.querySelector('template').content.cloneNode(true);
  input.querySelector('.label').innerHTML = field;
  input.querySelector('.input').value = this.globalData.fields[field];
  input.querySelector('.input').setAttribute('data-id', field);
  input.querySelector('.input').setAttribute('list', field);
  input.querySelector('datalist').setAttribute('id', field);
  const suggestions = this.globalData.suggestions[field];
  if(suggestions !== undefined && suggestions.length > 0) {
    suggestions.forEach((suggestion) => {
      const newOption = document.createElement('option');
      newOption.value = suggestion;
      input.querySelector('datalist').appendChild(newOption);
    })
  }
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
  
  fetch(`${globalData.pathPrefix}/${artefact}/${image}`, {method: 'POST', body: JSON.stringify(data), headers: {Authorization: apiKey}})
});