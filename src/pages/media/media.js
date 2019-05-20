import FileSaver from "file-saver";
import {
  config,
  swal
} from "../../../lib";
export default {
  data() {
    return {
      irData: {},
      hassInfo: undefined,
      settings: {
        manufacturer: "Unknown",
        supportedModels: "Unknown",
        supportedController: ["Broadlink"],
        supportedControllerSelected: "Broadlink",
        modes: undefined,
        sources: undefined
      },
      sendTarget: undefined,
      irDataReady: false,

      // Mix source
      sourceSelected: [],
      sourceName: undefined
    };
  },
  computed: {
    sourceList() {
      return this.settings.sources.split(",").map(m => m.trim());
    },
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
        console.log("xxx", evData);
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
      this.settings.modes = "off, on, previousChannel, nextChannel, volumeDown, volumeUp, mute";
      this.settings.sources = "EXT1, EXT2, VGA, HDMI";
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
        supportedModels: this.settings.supportedModels.split(",").map(m => m.replace(" ", "")),
        supportedController: this.settings.supportedControllerSelected,
        commandsEncoding: "Base64",
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];
        if (m.command === "source") {
          if (!jsonData.commands["sources"]) jsonData.commands["sources"] = {};
          jsonData.commands["sources"][m.source] = m.irCode;
        } else {
          jsonData.commands[m.command] = m.irCode;
        }
      });

      var blob = new Blob([JSON.stringify(jsonData, "")], {
        type: "application/json;charset=utf-8"
      });

      FileSaver.saveAs(blob, "your-ir-code.json");
      swal("Good job!", "Your file was downloaded! Please note that the device_code field only accepts positive numbers. The .json extension is not required.", "success", {
        button: "Oki!"
      });
    },
    setupComponent() {
      this.$validator.validateAll().then((result) => {
        this.irDataReady = true;
        if (!result) return alert("Please enter field is required.");
        let tempData = {};

        this.settings.modes.split(",").forEach(mode => {
          mode = mode.trim();
          tempData[mode] = {
            key: `${mode}`,
            command: mode,
            source: undefined,
            irCode: "",
            iconClass: config.iconIr.learn
          };
        });

        this.settings.sources.split(",").forEach(source => {
          source = source.trim();
          tempData[`source_${source}`] = {
            key: `source_${source}`,
            command: "source",
            source: source,
            irCode: "",
            iconClass: config.iconIr.learn
          };
        });

        this.irData = tempData;
      });
    },
    sendLearnCommand(_target) {
      console.log("Command was send..", _target.key);
      this.sendTarget = _target;
      this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learning);

      this.$store.state.socket.send(JSON.stringify({
        id: this.$store.state.socketId++,
        type: "call_service",
        //domain: "switch",
        domain: "script",
        service: this.$store.state.hassInfo.serviceCommand
      }));
    },
    changeBroadlinkCommand() {
      this.$store.state.hassInfo.serviceCommand = this.hassInfo.serviceCommand;
    },
    mixSource() {
      if (this.sourceSelected.length < 2) return alert("Chọn tối thiểu 2 đơn vị");

      this.irData.map(m1 => {
        if (m1.key === this.sourceSelected.map(m2 => `source_${m2}` === m1.key)) {
          if (m1.irCode === "") return alert("Ircode was nulled");
        }
      });
    }
  }
};