<template>
  <div id="app">
    <Algorand @files="updateFiles" />
    <h1>List of registered files</h1>
    <h5>ADDRESS: 7N3NCF342JXBVECI5IEB4LEKKD6FUHY6U2TZZ5BQYARIHXPGLPBJ2FKV3M</h5>
    <ul style="list-style:none;padding-left:0px;">
    </ul>

    <div class="container">
      <p style="margin: 50px auto 10px auto;">
        <small>
          For demostration purposes the algorand_white_paper.pdf is the only encrypted file. Use the
          <a href="https://github.com/redcpp/algorand-ipfs-js">Algorand-IPFS Integration</a>
          to visualize its contents.
        </small>
      </p>
      <ul class="responsive-table">
        <li class="table-header">
          <div class="col col-1">Filename</div>
          <div class="col col-2">IPFS Hash</div>
          <div class="col col-3">AlgoExplorer</div>
        </li>
        <li v-for="file in files" :key="file.filename" class="table-row">
          <div class="col col-1">{{ file.filename }}</div>
          <div class="col col-2 small">
            <a :href="`https://ipfs.io/ipfs/${file.cid}`">{{ file.cid }}</a>
          </div>
          <div class="col col-3 small">
            <a :href="`https://testnet.algoexplorer.io/tx/${file.txn}`">{{ file.txn }}</a>
          </div>
        </li>
      </ul>
    </div>
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

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.container {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 10px;
  padding-right: 10px;
}

h2 {
  font-size: 26px;
  margin: 20px 0;
  text-align: center;
  small {
    font-size: 0.5em;
  }
}

.small {
  font-size: 0.75em;
}

.responsive-table {
  li {
    border-radius: 3px;
    padding: 25px 30px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
    text-align: left;
    font-size: 0.9em;
  }
  .table-header {
    background-color: #95A5A6;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .table-row {
    background-color: #ffffff;
    box-shadow: 0px 0px 9px 0px rgba(0,0,0,0.1);
  }
  .col-1 {
    flex-basis: 20%;
  }
  .col-2 {
    flex-basis: 40%;
  }
  .col-3 {
    flex-basis: 40%;
  }
  
  @media all and (max-width: 1023px) {
    .table-header {
      display: none;
    }
    li {
      display: block;
    }
    .col {
      flex-basis: 100%;
    }
    .col {
      display: flex;
      padding: 10px 0;
      &:before {
        color: #6C7A89;
        padding-left: 10px;
        content: attr(data-label);
        flex-basis: 50%;
        text-align: left;
      }
    }
  }
}
</style>
