import config from "./config";
import store from "./store";
import FileSaver from "file-saver";
import swal from "sweetalert";

export default {
  watchScoketMsgs(evData, sendTarget) { },
  exportFileSaver(_jsonData) {
    let blob = new Blob([JSON.stringify(_jsonData, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    FileSaver.saveAs(blob, "your-ir-code.json");
    swal("Good job!", "Your file was downloaded! Please note that the device_code field only accepts positive numbers. The .json extension is not required.", "success", {
      button: "Oki!"
    });
  },
  extractCodesFromStorageCodesFile({ storageCodesFile, irData, storageFileDeviceKey }) {
    const reader = new FileReader();
    reader.readAsText(storageCodesFile);
    reader.addEventListener(
      "load",
      () => {
        const storageCodesFileContents = JSON.parse(reader.result);
        const codes = storageCodesFileContents && storageCodesFileContents.data[storageFileDeviceKey];

        if (!codes) {
          throw Error(`Can't find codes for "${storageFileDeviceKey}"`);
        }

        for (const irCommand of Object.values(irData)) {
          irCommand.irCode = codes[irCommand.key] || irCommand.irCode;
        }
      },
      { once: true }
    );
  },
  get nextSocketMessageId() {
    store.commit("socketId", store.state.socketId + 1);
    return store.state.socketId;
  },
  sendBroadlinkLearnCmd({ remoteId, command, storageFileDeviceKey }) {
    const messageId = this.nextSocketMessageId;
    store.state.socket.send(JSON.stringify({
      id: messageId,
      type: "call_service",
      service: "learn_command",
      domain: "remote",
      service_data: {
        command,
        command_type: "ir",
        device: storageFileDeviceKey,
        timeout: 10
      },
      target: {
        entity_id: remoteId
      }
    }));
    return messageId;
  },
  getRemotes() {
    return new Promise((resolve) => {
      const messageId = this.nextSocketMessageId;
      store.state.socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.id === messageId) {
          if (data.type === "result" && data.success === true) {
            resolve(
              data.result.filter(entity => entity.device_id && entity.entity_id.match(/^remote\./))
            );
          }
        }
      });
      store.state.socket.send(JSON.stringify({
        id: messageId,
        type: "config/entity_registry/list"
      }));
    });
  },
  getDupicateItem(_str1, _str2) {
    let temp = [];
    _str1.split(",").map(m1 => {
      m1 = m1.trim();
      _str2.split(",").map(m2 => {
        m2 = m2.trim();
        if (m1 === m2) temp.push(m2);
      });
    });
    return temp;
  },
  getTextClassByIcon(_icon) {
    switch (_icon) {
      case config.iconIr.learn:
        return "text-secondary";
      case config.iconIr.learnFalse:
        return "text-danger";
      case config.iconIr.learnSuccess:
        return "text-success";
      case config.iconIr.learning:
        return "text-primary";
      default:
        return "text-secondary";
    }
  }
};