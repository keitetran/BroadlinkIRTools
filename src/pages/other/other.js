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
      currentLearningInfo: undefined,
      availableRemotes: [],
      selectedRemoteId: undefined
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
        if (this.currentLearningInfo && (evData.id === this.currentLearningInfo.messageId)) {
          if (evData.type === "result" && evData.success === true) {
            this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learnSuccess);
            this.currentLearningInfo = undefined;
            return;
          }

          this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learnFalse);
        }
      }
    }
  },
  mounted() {
    if (this.$store.state.socketStatus === config.socketStatus.connected) {
      this.hassInfo = this.$store.state.hassInfo;
      helper.getRemotes().then(remotes => {
        this.availableRemotes = remotes;
        this.selectedRemoteId = this.availableRemotes[0]?.entity_id;
      });
    } else {
      return this.$router.push({
        path: "/"
      });
    };
  },
  methods: {
    handleStorageCodesUpload(event) {
      helper.extractCodesFromStorageCodesFile({
        storageFileDeviceKey: this.settings.storageFileDeviceKey,
        storageCodesFile: event.target.files[0],
        irData: this.irData
      });
    },
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
    sendLearnCommand(_target) {
      const messageId = helper.sendBroadlinkLearnCmd({
        remoteId: this.selectedRemoteId,
        command: _target.key,
        storageFileDeviceKey: this.settings.storageFileDeviceKey
      });
      console.log("Command was send..", _target.key);
      this.currentLearningInfo = {
        command: _target,
        messageId
      };
      this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learning);
    }
  }
};