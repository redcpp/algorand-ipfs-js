<template>
  <div id="app">
    <Algorand @files="updateFiles" />
    <h1>List of registered files</h1>
    <p>ADDRESS: F3K6DNWSP7C7U7C4VCMJVX7N723Q6GDGCFHEP2FLIV373FKAYD7LT2MU2I</p>
    <ul style="list-style:none;padding-left:0px;">
      <li v-for="file in files" :key="file.filename" style="padding:5px auto;">
        <a :href="`https://ipfs.io/ipfs/${file.cid}`">{{ file.filename }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import Algorand from "./components/Algorand";

export default {
  name: "App",
  components: {
    Algorand,
  },
  data: () => ({
    files: undefined
  }),
  methods: {
    updateFiles (files) {
      console.log(files)
      this.files = files
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
 
li {
  font: 200 20px/1.5 Helvetica, Verdana, sans-serif;
  border-bottom: 1px solid #ccc;
  margin: 0;
}
 
li:last-child {
  border: none;
}
 
li a {
  text-decoration: none;
  color: #000;
  display: block;
}

li a:visited {
  color: purple;
}
 
li a:hover {
  font-size: 24px;
  background: #f6f6f6;
}
</style>
