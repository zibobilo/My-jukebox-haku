// Declarations
let albums = [], titles = [], num = 0, updatedNum;

// ---- section albums ----
let carousel = document.getElementById('carousel'), carouselFill;
let cards = document.getElementsByClassName('cards');
let card1 = document.getElementById('card1');
let card2 = document.getElementById('card2');
let card3 = document.getElementById('card3');
let card4 = document.getElementById('card4');
let card5 = document.getElementById('card5');

// ---- section table/tracks ----
let table = document.getElementById('album-tracks'), tableFill;

// Handling each star color change on selection
function changeStarColor(num) {
  let star = document.getElementsByClassName('star')[num];
  if (star.className.includes("gold")) {
    star.className = "star grey"
  } else { star.className = "star gold" }
}

// This fonction will rotate & display the albums on click.
function updateCarousel(num) {
  
  carouselFill = `
    <div class="album-arrows">
      <div id="box-arrow1" onclick="getTitles(num -= 1)">
        <i class="arrow"></i>
      </div>
      <div id="box-arrow2" onclick="getTitles(num += 1)">
        <i class="arrow"></i>  
      </div>
    </div>
    <div id="cards">`
  
  for (let i = 0; i < 5; i++) {
    let rotation = (num + i + (albums.length - 2)) % albums.length
    if (i === 0) { updatedNum = `num -= 2` }
    if (i === 1) { updatedNum = `num -= 1` }
    if (i === 2) { updatedNum = `num` }
    if (i === 3) { updatedNum = `num += 1` }
    if (i === 4) { updatedNum = `num += 2` }
    
    carouselFill += `
      <div id="card${i + 1}" class ="card" onclick="getTitles(${updatedNum})">
        <img src="${albums[rotation].cover_photo_url}" alt""></img>
        <div class="margin-auto">
          <div class="text-album">${albums[rotation].name}</div>
          <div class="artist-name">${albums[rotation].artist_name}</div>
        </div>
      </div>`
  }
  carouselFill += `</div>`
  carousel.innerHTML = carouselFill
}

// This fonction will retrieve the albums information
function getAlbums() {
  fetch("https://cors-anywhere.herokuapp.com/https://stg-resque.hakuapp.com/albums.json")
    .then(data => data.json())
    .then(result => {
      albums = result

      // after all albums are loaded, we call & populate the titles of the first album
      getTitles(num)

      // and we populate the results in the carousel 
      updateCarousel(num)
    })
}

// get the albums as the page loads.
getAlbums()

// This fonction will query and display the tracks of the selected album on demand.
function getTitles(num) {

  // always setting the index to the correct value
  if (albums.length) {
    if (num < 0) {
      while (num < 0) { num = albums.length - Math.abs(num) }
    } else { num %= albums.length }
  } else { return }

  // Before the title query I want to update the carousel 
  updateCarousel(num)

  table.innerHTML = `Loading...`
  // API call for titles
  fetch(`https://cors-anywhere.herokuapp.com/https://stg-resque.hakuapp.com/songs.json?album_id=${num + 1}`)
    .then(data => data.json())
    .then(response => {
      titles = response

      //sort the titles
      titles.sort((a, b) => a.song_order - b.song_order)

      //Prepare to fill-in the tracks table
      tableFill = `
        <table class="track-table">
          <colgroup>
           <col style="width:6%">
           <col style="width:6%">
           <col style="width:78%; text-align: left">
           <col style="width:10%">
          </colgroup>`

      // Adding all the rows to the table
      for (let i = 0; i < titles.length; i++) {
        let upbeat = "", explicit = "";
        if (titles[i].song_label !== null && titles[i].song_label !== undefined) {
          if (titles[i].song_label.length > 0) {
            if (titles[i].song_label.length === 2) {
              explicit = `<span class="explicit">explicit</span>`
              upbeat = `<span class="upbeat">upbeat</span>`
            } else if (titles[i].song_label[0] === "upbeat") {
              upbeat = `<span class="upbeat">upbeat</span>`
            } else if (titles[i].song_label[0] === "explicit") {
              explicit = `<span class="explicit">explicit</span>`
            }
          }
        }
        tableFill +=
          `<tr>
            <td><span class="track-num">${titles[i].song_order}</span></td>
            <td><span class="star grey" onclick="changeStarColor(${i})">★</span></td>
            <td><span class="track-title-font">${titles[i].song_name}</span>
              ${explicit}${upbeat}</td>
            <td class="track-duration">${titles[i].song_duration}</td>
          </tr>`
      }
      tableFill += `</table>`
      // Set the innerHTML for that section      
      table.innerHTML = tableFill
    })
}
