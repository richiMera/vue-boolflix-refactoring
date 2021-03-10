var app = new Vue({

    el: '#app',
    data: {
        scrollPosition: null,
        search: '',
        genres: [],
        films: [],
        tvSeries: [],
        filteredShowList: [],
        showsList: [],
        path: 'https://image.tmdb.org/t/p/w342/',
        // https://image.tmdb.org/t/p/w342/
        defaultImg: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        fullStar: "fas fa-star",
        emptyStar: "far fa-star",
        myApiKey: '2dbf921bb98f37f2f23b462ffd4a6e66',
        select: ''
    },
    mounted(){
      //richiamo le api per avere le opzioni della selection dei generi
      Promise.all([
          axios.get('https://api.themoviedb.org/3/genre/movie/list',
          {
              params: {
                  api_key: this.myApiKey,
                  query: this.search,
                  language: 'it-IT'
              }
          }),
          axios.get('https://api.themoviedb.org/3/genre/tv/list',
          {
              params: {
                  api_key: this.myApiKey,
                  query: this.search,
                  language: 'it-IT'
              }
          })
      ])
      .then((response) => {
          //salvo i risultati nell'array dei generi
          const moviesGenresArray = response[0].data.genres;
          const seriesGenresArray = response[1].data.genres;
          
          moviesGenresArray.forEach(element => {
              seriesGenresArray.forEach((item, index) => {
                  if (element.id == item.id) {
                      seriesGenresArray.splice(index, 1);
                  }
              });
          });
          this.genres = moviesGenresArray.concat(seriesGenresArray);
      });

      window.addEventListener('scroll', this.updateScroll);
  },
    methods: {
        updateScroll() {
            this.scrollPosition = window.scrollY
        },
        getCastName(achtors){
            const cast = [];

            achtors.forEach(element => {
                if (cast.length < 5) {
                    cast.push(element.name);
                } else return cast;
            });
            return cast;
        },
        //stampo il cast di un array
        printCast(show, array){
            const newArray = []
            for(let i = 0; i < array.length; i++) {
                axios.get(`https://api.themoviedb.org/3/${show}/${array[i].id}/credits`, {
                    params: {
                        api_key: this.myApiKey
                    }
                })
                .then(response => {
                    let cast = response.data.cast;

                    this.showsList.push({
                        ...array[i],
                        cast: this.getCastName(cast)
                    });
                    newArray.push({
                        ...array[i],
                        cast: this.getCastName(cast)
                    });
                    this.$forceUpdate();
                });
            }
            if (show == 'tv') {
                this.tvSeries = newArray;
            } else this.films = newArray;
        },
        filterFilms(){
            if (this.search != '') {
                this.reset();
                Promise.all([
                //chiamata API movie
                    axios.get('https://api.themoviedb.org/3/search/movie',
                    {
                        params: {
                            api_key: this.myApiKey,
                            query: this.search,
                            language: 'it-IT'
                        }
                    }),
                    //chiamata API serie
                    axios.get('https://api.themoviedb.org/3/search/tv',
                    {
                        params: {
                            api_key: this.myApiKey,
                            query: this.search,
                            language: 'it-IT'
                        }
                    })
                ])
                .then((response) => {
                    //salvo i risultati nell'array movies
                    this.films = response[0].data.results;
                    this.tvSeries = response[1].data.results;

                    //cast di film e serie
                    this.printCast('movie', this.films);                    
                    this.printCast('tv', this.tvSeries);

                    this.filteredShowList = this.showsList;

                    this.search = '';
                    
                });
            }
        },
        imgFunction: function(image) { // GENERATE POSTER_PATH OR DEFAULT IMAGE
            if(image ) {
                return this.path + image;
            } else {
                return this.defaultImg;
            }
        },
        generateFlags: function(language) { // PRINT FLAGS FUNCTION
            if(language == 'it') {
                return "img/it-flag.png";
            } else if (language == 'es') {
                return "img/esp-flag.png";
            } else if (language == 'en') {
                return "img/uk-flag.png";
            } else {
                return 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Flag_of_Esperanto_new.svg';
            }
        },
          voteFunction: function(voto, index) { // FUNCTION TO CALCOLATE STARS AVARAGE
      
            if(Math.ceil(voto) / 2 > index) {
                return this.fullStar;
            } else {
                return this.emptyStar;
            }
      
          },
          getGenre(arrOfGenre) {         
            const genres = [];   
            this.genres.forEach(element => {
                if (arrOfGenre.includes(element.id)) {
                    genres.push(element.name);
                }
            });
            return genres;
        },
        filterByGenre(){
            if (this.select == ''){
                this.filteredShowList = this.showsList;
            } else {
                this.filteredShowList = this.showsList.filter((element) => {
                    return element.genre_ids.includes(this.select.id);
                });
            }
        },
           //stampo film popolari
        popularFilms()  {
            this.select = '';
            if(this.films.length == 0){
                this.reset();
                axios.get('https://api.themoviedb.org/3/movie/popular',
                        {
                            params: {
                                api_key: this.myApiKey,
                                language: 'it-IT'
                            }
                        })
                        .then(response => {
                            this.filteredShowList = response.data.results;
                            this.printCast('movie', this.filteredShowList);
                            this.filteredShowList = this.showsList;
                        });
            } else {
                this.filteredShowList = this.films;
            }
        },
        //stampo serie tv popolari
        popularSeries() {     
            this.select = '';    
            if(this.tvSeries.length == 0){
                this.reset();
                axios.get('https://api.themoviedb.org/3/tv/popular',
                {
                    params: {
                        api_key: this.myApiKey,
                        language: 'it-IT'
                    }
                })
                .then(response => {
                    this.filteredShowList = response.data.results;
                    this.printCast('tv', this.filteredShowList);
                    this.filteredShowList = this.showsList;
                });
            }   else {
                    this.filteredShowList = this.tvSeries;
                }
        },
        //stampo tutti gli show popolari
        popularFromAll(){
            this.reset();
                Promise.all([
                    //chiamata API movie
                    axios.get('https://api.themoviedb.org/3/movie/popular',
                    {
                        params: {
                            api_key: this.myApiKey,
                            language: 'it-IT'
                        }
                    }),
                    //chiamata API serie
                    axios.get('https://api.themoviedb.org/3/tv/popular',
                    {
                        params: {
                            api_key: this.myApiKey,
                            language: 'it-IT'
                        }
                    })
                ])
                .then((response) => {
                    //salvo i risultati nell'array movies
                    const popFilms = response[0].data.results;
                    const popSeries = response[1].data.results;

                    //cast
                    this.printCast('movie', popFilms);
                    this.printCast('tv', popSeries);

                    this.filteredShowList = this.showsList;
                });
                console.log(this.filteredShowList);
        },
         reset() {
          this.showsList = [];
          this.filteredShowList = [];
          this.films = [];
          this.tvSeries = [];
          this.select = '';
      }//fine funzione
    }
    
})







