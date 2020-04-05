import Vue from 'vue';
import Vuex from 'vuex';
import { mobileCheck } from '../utils/helper.js';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    displayData: 'fish',
    sortType: 'name',
    hideCaught: false,
    hideUncaught: false,
    caught: {
      fish: [],
      insects: []
    }
  },
  mutations: {
    toggleHideCaught(state) {
      state.hideCaught = !state.hideCaught;
      if (!!state.hideCaught) state.hideUncaught = false;
    },
    toggleHideUncaught(state) {
      state.hideUncaught = !state.hideUncaught;
      if (!!state.hideUncaught) state.hideCaught = false;
    },
    assignDisplayData(state, data) {
      state.displayData = data;
    },
    assignSortType(state, data) {
      state.sortType = data;
    },
    storeFish(state, data) {
      if (state.caught.fish.includes(data)) {
        state.caught.fish = state.caught.fish.filter(elem => elem != data);
      } else {
        /*
        * Since we aren't using a typesafe language, I was too lazy to make this function typesafe
        * The result is this ternary since 'data' can be an array or a string
        * The spread operator will spread strings into an array split at each character - which we obviously don't want
        * :) fuck you
        */
        state.caught.fish = typeof data === 'string' ? [data, ...state.caught.fish] : [...data, ...state.caught.fish];
      }
    },
    storeInsect(state, data) {
      if (state.caught.insects.includes(data)) {
        state.caught.insects = state.caught.insects.filter(elem => elem != data);
      } else {
        state.caught.insects = typeof data === 'string' ? [data, ...state.caught.insects] : [...data, ...state.caught.insects];
      }
    },
    storeFishRaw(state, data) {
      state.caught.fish = data;
    },
    storeInsectsRaw(state, data) {
      state.caught.insects = data;
    }
  },
  actions: {
    // get all data from localstorage and save to store
    getData({ commit }) {
      let isMobile = mobileCheck();
      if (!localStorage.getItem('version') && isMobile) {
        alert('New version found!');
        localStorage.setItem('version', '1.4');
        window.location.reload(true)
      }
      // save existing data to temporary variable, save empty object if no data exists
      const caught = preserveLegacyData() || JSON.parse(localStorage.getItem('caught')) || {};
      // get selection data (fish/insects, month/name)
      const data = JSON.parse(localStorage.getItem('selection'));
      if (data) {
        commit('assignDisplayData', data.displayData);
        commit('assignSortType', data.sortType);
      }
      if (caught.fish)
        commit('storeFish', caught.fish);
      if (caught.insects)
        commit('storeInsect', caught.insects);
    },
    storeData({ state }) {
      localStorage.setItem('caught', JSON.stringify(state.caught));
    },
    storeSelection({ state }) {
      const data = {
        displayData: state.displayData,
        sortType: state.sortType
      }
      localStorage.setItem('selection', JSON.stringify(data));
    }
  }
});


const preserveLegacyData = () => {
  // retrieve legacy data
  const fish = localStorage.getItem('myfishies');
  const insects = localStorage.getItem('myinsecties');
  // early return if no legacy data exists
  if (!fish && !insects) return false;

  const newObj = { fish: [], insects: [] };
  const pattern = /([a-z])([A-Z])/g;

  // turn legacy data into cleaned array
  if (!!fish && fish.length > 0) {
    newObj.fish = fish.replace(pattern, '$1,$2').split(',');
  }
  if (!!insects && insects.length > 0) {
    newObj.insects = insects.replace(pattern, '$1,$2').split(',');
  }

  // remove legacy from localstorage if it exists and has been preserved in newObj
  if (JSON.stringify(newObj).length > 2) {
    localStorage.removeItem('myfishies');
    localStorage.removeItem('myinsecties');
  }
  return newObj;
}

export default store;