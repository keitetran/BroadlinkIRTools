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
        fanModes: "auto, level1, level2, level3, level4"
      },
      sendTarget: undefined
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
        if (evData.event && evData.event.data.new_state.state === "notifying" && evData.event.event_type === "state_changed") {
          let message = evData.event.data.new_state.attributes.message;
          let irCode = message.replace("Received packet is: ", "");
          this.$set(this.irData[this.sendTarget.key], "irCode", irCode);

          if (message === "Did not received any signal") {
            this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learnFalse);
            return;
          }

          this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learnSuccess);
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
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];
        if (m.operationMode === "off") {
          jsonData.commands[m.operationMode] = m.irCode;
        } else {
          if (!jsonData.commands[m.operationMode]) jsonData.commands[m.operationMode] = {};
          if (!jsonData.commands[m.operationMode][m.fanMode]) jsonData.commands[m.operationMode][m.fanMode] = {};
          if (!jsonData.commands[m.operationMode][m.fanMode][m.temp]) jsonData.commands[m.operationMode][m.fanMode][m.temp] = {};
          jsonData.commands[m.operationMode][m.fanMode][m.temp] = m.irCode;
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
        _that.settings.operationModes.split(",").forEach(operationMode => {
          operationMode = operationMode.trim();
          _that.settings.fanModes.split(",").forEach(fanMode => {
            fanMode = fanMode.trim();
            _that.sendCmdTempList.forEach(temp => {
              _that.$set(_that.irData, `${operationMode}_${fanMode}_${temp}`, {
                key: `${operationMode}_${fanMode}_${temp}`,
                operationMode: operationMode,
                fanMode: fanMode,
                temp: temp,
                irCode: "",
                iconClass: config.iconIr.learn
              });
            });
          });
        });
      });
    },
    sendLearnCommand(_target) {
      console.log("Command was send..", _target.key);
      this.sendTarget = _target;
      this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learning);
      helper.sendBroadlinkLearnCmd(this.$store.state.hassInfo.broadlinkIp);
    },
    changeBroadlinkIp() {
      this.$store.state.hassInfo.broadlinkIp = this.hassInfo.broadlinkIp;
    }
  }
};