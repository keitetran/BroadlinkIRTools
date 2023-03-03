import {
  config,
  helper
} from "../../../lib";
export default {
  data() {
    return {
      irData: {
        off: {
          key: "off",
          fanMode: "off",
          speed: null,
          irCode: "",
          iconClass: config.iconIr.learn
        }
      },
      irDataReady: false,
      hassInfo: undefined,
      settings: {
        manufacturer: "Unknown",
        supportedModels: "Unknown",
        supportedController: ["Broadlink"],
        supportedControllerSelected: "Broadlink",
        fanModes: "reverse, forward",
        speeds: "level1, level2, level3, level4, level5, level6",
        storageFileDeviceKey: undefined
      },
      currentLearningInfo: undefined,
      availableRemotes: [],
      selectedRemoteId: undefined
    };
  },
  computed: {
    hassInfoStatus() {
      if (this.$store.state.socketStatus !== config.socketStatus.connected) return true;
      if (this.irDataReady === true) return true;
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
    exportFile() {
      let jsonData = {
        manufacturer: this.settings.manufacturer,
        supportedModels: this.settings.supportedModels.split(",").map(m => m.trim()),
        supportedController: this.settings.supportedControllerSelected,
        commandsEncoding: "Base64",
        speeds: this.settings.speeds.split(",").map(m => m.trim()),
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];
        if (m.fanMode === "off") {
          jsonData.commands[m.fanMode] = m.irCode;
        } else {
          if (!jsonData.commands[m.fanMode]) jsonData.commands[m.fanMode] = {};
          jsonData.commands[m.fanMode][m.speed] = m.irCode;
        }
      });

      // export file
      helper.exportFileSaver(jsonData);
    },
    setupComponent() {
      this.$validator.validateAll().then((result) => {
        if (!result) return alert("Please enter field is required.");
        this.irDataReady = true;
        let _that = this;
        _that.settings.fanModes.split(",").forEach(fanMode => {
          fanMode = fanMode.trim();
          _that.settings.speeds.split(",").forEach(speed => {
            speed = speed.trim();
            _that.$set(_that.irData, `${fanMode}_${speed}`, {
              key: `${fanMode}_${speed}`,
              fanMode: fanMode,
              speed: speed,
              irCode: "",
              iconClass: config.iconIr.learn
            });
          });
        });

        this.settings.storageFileDeviceKey = `BroadlinkIRTools - ${this.settings.manufacturer} - ` +
          `${this.settings.supportedModels} - ${Math.floor(Math.random() * 1000000)}`;
      });
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