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
          operationMode: "off",
          fanMode: null,
          temp: null,
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
        precision: 1.0,
        minTemperature: 18,
        maxTemperature: 32,
        operationModes: "cool, heat",
        fanModes: "auto, level1, level2, level3, level4",
        swingModesEnabled: false,
        swingModes: "static, swing",
        storageFileDeviceKey: undefined
      },
      currentLearningInfo: undefined,
      availableRemotes: undefined,
      selectedRemoteId: undefined
    };
  },
  computed: {
    hassInfoStatus() {
      if (this.$store.state.socketStatus !== config.socketStatus.connected) return true;
      if (this.irDataReady === true) return true;
      return false;
    },
    sendCmdModeList() {
      if ($.isEmptyObject(this.settings.operationModes)) return;
      return this.settings.operationModes
        .split(",")
        .map(m => m.trim());
    },
    sendCmdFanList() {
      if ($.isEmptyObject(this.settings.fanModes)) return;
      return this.settings.fanModes.split(",").map(m => m.trim());
    },
    sendCmdTempList() {
      let temp = [];
      let index = this.settings.minTemperature * 1;
      while (index <= this.settings.maxTemperature * 1) {
        temp.push(index);
        index = index + this.settings.precision * 1;
      }
      return temp;
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
        supportedModels: this.settings.supportedModels.split(",").map(m2 => m2.trim()),
        commandsEncoding: "Base64",
        supportedController: this.settings.supportedControllerSelected,
        minTemperature: parseInt(this.settings.minTemperature),
        maxTemperature: parseInt(this.settings.maxTemperature),
        precision: parseFloat(this.settings.precision),
        operationModes: this.settings.operationModes.split(",").map(m2 => m2.trim()),
        fanModes: this.settings.fanModes.split(",").map(m2 => m2.trim()),
        ...(this.settings.swingModesEnabled ? { swingModes: this.settings.swingModes.split(",").map(mode => mode.trim()) } : {}),
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];

        let path = jsonData.commands;

        if (m.operationMode === "off") {
          path[m.operationMode] = m.irCode;
          return;
        }

        if (!path[m.operationMode]) path[m.operationMode] = {};
        path = path[m.operationMode];

        if (!path[m.fanMode]) path[m.fanMode] = {};
        path = path[m.fanMode];

        if (this.settings.swingModesEnabled) {
          if (!path[m.swingMode]) path[m.swingMode] = {};
          path = path[m.swingMode];
        }

        path[m.temp] = m.irCode;
      });

      // export file
      helper.exportFileSaver(jsonData);
    },
    setupComponent() {
      this.$validator.validateAll().then((result) => {
        if (!result) return alert("Please enter field is required.");
        this.irDataReady = true;
        const operationModes = this.settings.operationModes.split(",").map(operationMode => operationMode.trim());
        const fanModes = this.settings.fanModes.split(",").map(fanMode => fanMode.trim());
        const swingModes = this.settings.swingModesEnabled
          ? this.settings.swingModes.split(",").map(swingMode => swingMode.trim())
          : [null];
        const temperatures = this.sendCmdTempList;

        for (const operationMode of operationModes) {
          for (const fanMode of fanModes) {
            for (const swingMode of swingModes) {
              for (const temperature of temperatures) {
                const key = this.settings.swingModesEnabled
                  ? `${operationMode}_${fanMode}_${swingMode}_${temperature}`
                  : `${operationMode}_${fanMode}_${temperature}`;
                this.$set(this.irData, key, {
                  key,
                  operationMode,
                  fanMode,
                  swingMode,
                  temp: temperature,
                  irCode: "",
                  iconClass: config.iconIr.learn
                });
              }
            }
          }
        }

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