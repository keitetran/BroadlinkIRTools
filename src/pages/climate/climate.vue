<template>
  <div class="row h-100">
    <div class="col h-100" style="overflow: hidden; overflow-y: auto;">
      <div class="row align-content-center">
        <div class="col-12">
          <h3 class="mb-0">
            <router-link class="btn btn-secondary btn-sm" to="/"><i class="fas fa-chevron-left" /></router-link>
            <span>Cimate</span>
          </h3>
          <p>Create by Keite Trần https://github.com/keitetran/BroadlinkIRTools
            <br>
            More questtion post <a href="https://github.com/keitetran/BroadlinkIRTools/issues">here</a>
          </p>
        </div>
        <div class="col-12">
          <div class="form-group">
            <h5>Connection status <span class="badge badge-success">{{ $store.state.socketStatus }}</span></h5>
          </div>

          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.manufacturer') }">
            <label class="mb-0">IR receiver</label>
            <template v-if="availableRemotes && (availableRemotes.length > 0)">
              <select v-model="selectedRemoteId">
                <option v-for="remote in availableRemotes" :key="remote.entity_id">{{ remote.entity_id }}</option>
              </select>
            </template>
            <template v-else-if="availableRemotes">
              <span class="form-group is-invalid">
                <span class="form-text">No remotes found in Home Assistant</span>
              </span>
            </template>
            <template v-else>
              Loading...
            </template>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h4>1. IR settings</h4>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.manufacturer') }">
            <label class="mb-0">Manufacturer</label>
            <input v-model="settings.manufacturer" v-validate="'required'" :disabled="hassInfoStatus" data-vv-as="manufacturer" name="settings.manufacturer" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.manufacturer')" class="form-text text-muted">{{ errors.first('settings.manufacturer') }}</small>
            <small v-else class="form-text text-muted">Ex: Sharp, Sanasonic, Samsung...</small>
          </div>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.supportedModels') }">
            <label class="mb-0">Supported Models</label>
            <input v-model="settings.supportedModels" v-validate="'required'" :disabled="hassInfoStatus" data-vv-as="supported models" name="settings.supportedModels" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.supportedModels')" class="form-text text-muted">{{ errors.first('settings.supportedModels') }}</small>
            <small v-else class="form-text text-muted">Ex: AR29MB, AY24X...</small>
          </div>
          <div class="form-group mb-1">
            <label class="mb-0">Supported Controller</label>
            <select v-model="settings.supportedControllerSelected" :disabled="hassInfoStatus" class="form-control form-control-sm">
              <option v-for="(item, index) in settings.supportedController" :key="index" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.precision') }">
            <label class="mb-0">Precision</label>
            <input v-model="settings.precision" v-validate="'required|decimal:2'" :disabled="hassInfoStatus" data-vv-as="supported models" name="settings.precision" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.precision')" class="form-text text-muted">{{ errors.first('settings.precision') }}</small>
            <small v-else>Some device only work with value 0.5, make sure it is float number. </small>
          </div>
          <div class="row">
            <div class="col-6 pr-1">
              <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.minTemperature') }">
                <label class="mb-0">Min Temperature</label>
                <input v-model="settings.minTemperature" v-validate="'required|digits:2'" :disabled="hassInfoStatus" data-vv-as="min temperature" name="settings.minTemperature" maxlength="2" type="text" class="form-control form-control-sm">
                <small v-if="errors.has('settings.minTemperature')" class="form-text text-muted">{{ errors.first('settings.minTemperature') }}</small>
              </div>
            </div>
            <div class="col-6 pl-1">
              <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.maxTemperature') }">
                <label class="mb-0">Max Temperature</label>
                <input v-model="settings.maxTemperature" v-validate="'required|digits:2'" :disabled="hassInfoStatus" data-vv-as="max temperature" name="settings.maxTemperature" maxlength="2" type="text" class="form-control form-control-sm">
                <small v-if="errors.has('settings.maxTemperature')" class="form-text text-muted">{{ errors.first('settings.maxTemperature') }}</small>
              </div>
            </div>
          </div>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.operationModes') }">
            <label class="mb-0">Operation Modes</label>
            <input v-model="settings.operationModes" v-validate="'required'" :disabled="hassInfoStatus" data-vv-as="operation Modes" name="settings.operationModes" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.operationModes')" class="form-text text-muted">{{ errors.first('settings.operationModes') }}</small>
            <small v-else class="form-text text-muted">Ex: cool, heat, dry, ion</small>
          </div>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.fanModes') }">
            <label class="mb-0">Fan Modes</label>
            <input v-model="settings.fanModes" v-validate="'required'" :disabled="hassInfoStatus" data-vv-as="fan modes" name="settings.fanModes" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.fanModes')" class="form-text text-muted">{{ errors.first('settings.fanModes') }}</small>
            <small v-else class="form-text text-muted">Ex: auto, level1, level2, level3, level4</small>
          </div>
          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.fanModes') }">
            <label class="mb-0" for="swingModeInput">Swing Modes</label>
            <div class="form-check">
              <input id="swingModesEnabledInput" v-model="settings.swingModesEnabled" :disabled="hassInfoStatus" data-vv-as="swing modes enabled" name="settings.swingModesEnabled" type="checkbox" class="form-check-input">
              <label class="form-check-label" for="swingModesEnabledInput">
                <span style="height: 0; display: block; width: 0;overflow: hidden;">Swing Modes </span>Enabled
              </label>
            </div>

            <input id="swingModeInput" v-model="settings.swingModes" v-validate="settings.swingModesEnabled ? 'required' : ''" :disabled="!settings.swingModesEnabled || hassInfoStatus" data-vv-as="swing modes" name="settings.swingModes" type="text" class="form-control form-control-sm">
            <small v-if="errors.has('settings.swingModes')" class="form-text text-muted">{{ errors.first('settings.swingModes') }}</small>
            <small v-else class="form-text text-muted">Ex: static, swing</small>
          </div>
          <div class="form-group mb-1">
            <button type="button" :disabled="hassInfoStatus" class="btn btn-primary btn-sm mt-2" @click="setupComponent()"><i class="fas fa-cogs mr-1" /> Create table code</button>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h4>2. Import codes storage file</h4>
          Once finished learning the code for each command upload the storage codes file. It is located in your Home Assistant config folder in a sub-folder called <strong>.storage</strong>. Inside of that you should find the storage codes file called something like <strong>broadlink_remote_abc123_codes</strong> (note: your file will have a different value instead of abc123).
          <div class="form-group mb-1">
            <button type="button" :disabled="!irDataReady" class="btn btn-primary btn-sm mt-2" @click="$refs.uploadStorageCodesFileInputElm.click()"> <i class="fas fa-file-upload mr-1" />Import storage codes file</button>
          </div>
          <input ref="uploadStorageCodesFileInputElm" type="file" style="display: none;" @change="handleStorageCodesUpload">
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h4>3. Export to json</h4>
          <div class="form-group mb-1">
            <button type="button" :disabled="!irDataReady" class="btn btn-primary btn-sm mt-2" @click="exportFile()"> <i class="fas fa-file-download mr-1" /> Export JSON file</button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-9 p-0 tableResult">
      <template v-if="irDataReady">
        <div class="alert alert-warning p-2 mb-0 border-radius-0">
          Click to icon <i class="fas fa-wifi" /> then press your remote button to learn IR code.
          Or icon <i class="fas fa-times" /> for relearn IR code if error.
          Please wait for command response come.
        </div>
        <table class="table table-bordered mb-0">
          <thead>
            <tr>
              <th class="text-center" style="width: 20px;">#</th>
              <th class="text-center" style="width: 20px;">Mode</th>
              <th class="text-center" style="width: 20px;">Fan</th>
              <th v-if="settings.swingModesEnabled" class="text-center" style="width: 20px;">Swing</th>
              <th class="text-center" style="width: 20px;">Temp</th>
              <th>IR code</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in irData" :key="index" :ref="'irKey_' + item.key">
              <td class="text-center">
                <button :class="$helper.getTextClassByIcon(item.iconClass)" style="background: none; border: none; padding: 0;" :disabled="currentLearningInfo && currentLearningInfo.command && currentLearningInfo.command !== item" @click="sendLearnCommand(item)">
                  <i :class="item.iconClass" />
                </button>
              </td>
              <td class="text-center">{{ item.operationMode }}</td>
              <td class="text-center">{{ item.fanMode }}</td>
              <td v-if="settings.swingModesEnabled" class="text-center">{{ item.swingMode }}</td>
              <td class="text-center">{{ item.temp }}</td>
              <td>{{ item.irCode }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <div v-else class="alert alert-danger border-radius-0 p-2">Click to button Create table code for render</div>
    </div>
  </div>
</template>

<style>
button:disabled {
  opacity: 0.5;
}
</style>

<script src="./climate.js"></script>
