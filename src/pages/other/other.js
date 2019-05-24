import {
  config,
  helper
} from "../../../lib";
export default {
  data() {
    return {
      irData: [{
        name: undefined,
        irCode: "",
        iconClass: config.iconIr.learn
      }],
      hassInfo: undefined,
      sendTarget: undefined
    };
  },
  computed: {
    hassInfoStatus() {
      if (this.$store.state.socketStatus !== config.socketStatus.connected) return true;
      return false;
    }
  },
  watch: {
    "$store.state.socketMsgs": {
      deep: true,
      handler: function (evData) {
        console.log("xxx", evData);
        if (evData.event && evData.event.data.new_state.state === "notifying" && evData.event.event_type === "state_changed") {
          let message = evData.event.data.new_state.attributes.message;
          let irCode = message.replace("Received packet is: ", "");
          this.$set(this.irData[this.sendTarget], "irCode", irCode);

          if (message === "Did not received any signal") {
            this.$set(this.irData[this.sendTarget], "iconClass", config.iconIr.learnFalse);
            return;
          }

          this.$set(this.irData[this.sendTarget], "iconClass", config.iconIr.learnSuccess);
          this.sendTarget = undefined;
        }
      }
    }
  },
  mounted() {
    if (this.$store.state.hassInfo) {
      this.hassInfo = this.$store.state.hassInfo;
    } else {
      return this.$router.push({
        path: "/"
      });
    };
  },
  methods: {
    addMoreCode() {
      this.irData.push({
        name: undefined,
        irCode: "",
        iconClass: config.iconIr.learn
      });
    },
    exportFile() {
      let jsonData = {};
      this.irData.map(m => {
        if (m.name) jsonData[m.name] = m.irCode;
      });
      // export file
      helper.exportFileSaver(jsonData);
    },
    sendLearnCommand(_index) {
      console.log("Command was send..", _index);
      this.sendTarget = _index;
      this.$set(this.irData[_index], "iconClass", config.iconIr.learning);
      helper.sendBroadlinkLearnCmd(this.$store.state.hassInfo.broadlinkIp);
    },
    changeBroadlinkIp() {
      this.$store.state.hassInfo.broadlinkIp = this.hassInfo.broadlinkIp;
    }
  }
};