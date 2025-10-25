// Tableau Cloud REST API handler
class TableauCloudAPI {
  constructor(serverUrl, siteName, tokenName, tokenValue) {
    this.serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
    this.siteName = siteName;
    this.tokenName = tokenName;
    this.tokenValue = tokenValue;
    this.authToken = null;
    this.siteId = null;
    this.apiVersion = '3.19'; // Tableau REST API version
  }

  /**
   * Sign in to Tableau Cloud using Personal Access Token (PAT)
   */
  async signIn() {
    const signInUrl = `${this.serverUrl}/api/${this.apiVersion}/auth/signin`;

    const requestBody = {
      credentials: {
        personalAccessTokenName: this.tokenName,
        personalAccessTokenSecret: this.tokenValue,
        site: {
          contentUrl: this.siteName
        }
      }
    };

    try {
      const response = await fetch(signInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`認証エラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.authToken = data.credentials.token;
      this.siteId = data.credentials.site.id;

      return {
        success: true,
        token: this.authToken,
        siteId: this.siteId
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Get all data sources from the site
   */
  async getDataSources() {
    if (!this.authToken || !this.siteId) {
      throw new Error('認証されていません。先に接続してください。');
    }

    const dataSourcesUrl = `${this.serverUrl}/api/${this.apiVersion}/sites/${this.siteId}/datasources`;

    try {
      const response = await fetch(dataSourcesUrl, {
        method: 'GET',
        headers: {
          'X-Tableau-Auth': this.authToken,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`データソース取得エラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.datasources?.datasource || [];
    } catch (error) {
      console.error('Get data sources error:', error);
      throw error;
    }
  }

  /**
   * Sign out from Tableau Cloud
   */
  async signOut() {
    if (!this.authToken) {
      return;
    }

    const signOutUrl = `${this.serverUrl}/api/${this.apiVersion}/auth/signout`;

    try {
      await fetch(signOutUrl, {
        method: 'POST',
        headers: {
          'X-Tableau-Auth': this.authToken
        }
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.authToken = null;
      this.siteId = null;
    }
  }
}

// UI Controller
class UIController {
  constructor() {
    this.api = null;
    this.initializeElements();
    this.attachEventListeners();
    this.loadSavedSettings();
  }

  initializeElements() {
    this.serverUrlInput = document.getElementById('server-url');
    this.siteNameInput = document.getElementById('site-name');
    this.tokenNameInput = document.getElementById('token-name');
    this.tokenValueInput = document.getElementById('token-value');
    this.connectBtn = document.getElementById('connect-btn');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.clearSettingsBtn = document.getElementById('clear-settings-btn');
    this.statusMessage = document.getElementById('status-message');
    this.datasourcesSection = document.getElementById('datasources-section');
    this.datasourcesList = document.getElementById('datasources-list');
  }

  attachEventListeners() {
    this.connectBtn.addEventListener('click', () => this.handleConnect());
    this.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
    this.clearSettingsBtn.addEventListener('click', () => this.handleClearSettings());
  }

  async loadSavedSettings() {
    try {
      const result = await chrome.storage.local.get(['serverUrl', 'siteName', 'tokenName']);
      if (result.serverUrl) this.serverUrlInput.value = result.serverUrl;
      if (result.siteName) this.siteNameInput.value = result.siteName;
      if (result.tokenName) this.tokenNameInput.value = result.tokenName;
    } catch (error) {
      console.error('Failed to load saved settings:', error);
    }
  }

  async handleSaveSettings() {
    try {
      await chrome.storage.local.set({
        serverUrl: this.serverUrlInput.value,
        siteName: this.siteNameInput.value,
        tokenName: this.tokenNameInput.value
      });
      this.showStatus('設定を保存しました', 'success');
    } catch (error) {
      this.showStatus('設定の保存に失敗しました: ' + error.message, 'error');
    }
  }

  async handleClearSettings() {
    try {
      await chrome.storage.local.clear();
      this.serverUrlInput.value = '';
      this.siteNameInput.value = '';
      this.tokenNameInput.value = '';
      this.tokenValueInput.value = '';
      this.showStatus('設定をクリアしました', 'info');
      this.datasourcesSection.style.display = 'none';
    } catch (error) {
      this.showStatus('設定のクリアに失敗しました: ' + error.message, 'error');
    }
  }

  async handleConnect() {
    const serverUrl = this.serverUrlInput.value.trim();
    const siteName = this.siteNameInput.value.trim();
    const tokenName = this.tokenNameInput.value.trim();
    const tokenValue = this.tokenValueInput.value.trim();

    // Validation
    if (!serverUrl || !siteName || !tokenName || !tokenValue) {
      this.showStatus('すべてのフィールドを入力してください', 'error');
      return;
    }

    // Validate server URL format
    try {
      new URL(serverUrl);
    } catch {
      this.showStatus('有効なサーバーURLを入力してください (例: https://your-site.online.tableau.com)', 'error');
      return;
    }

    this.showStatus('接続中...', 'info');
    this.connectBtn.disabled = true;

    try {
      // Create API instance
      this.api = new TableauCloudAPI(serverUrl, siteName, tokenName, tokenValue);

      // Sign in
      await this.api.signIn();
      this.showStatus('認証成功！データソースを取得中...', 'success');

      // Get data sources
      const dataSources = await this.api.getDataSources();

      // Display data sources
      this.displayDataSources(dataSources);
      this.showStatus(`${dataSources.length}件のデータソースを取得しました`, 'success');

    } catch (error) {
      this.showStatus('エラー: ' + error.message, 'error');
      console.error('Connection error:', error);
    } finally {
      this.connectBtn.disabled = false;
    }
  }

  displayDataSources(dataSources) {
    // Clear previous results
    this.datasourcesList.innerHTML = '';

    if (!dataSources || dataSources.length === 0) {
      this.datasourcesList.innerHTML = '<div class="no-data">データソースが見つかりませんでした</div>';
      this.datasourcesSection.style.display = 'block';
      return;
    }

    // Create data source items
    dataSources.forEach(ds => {
      const item = this.createDataSourceItem(ds);
      this.datasourcesList.appendChild(item);
    });

    this.datasourcesSection.style.display = 'block';
  }

  createDataSourceItem(dataSource) {
    const div = document.createElement('div');
    div.className = 'datasource-item';

    const name = document.createElement('div');
    name.className = 'datasource-name';
    name.textContent = dataSource.name || 'Unnamed Data Source';

    const info = document.createElement('div');
    info.className = 'datasource-info';

    // Add type
    if (dataSource.type) {
      const typeSpan = document.createElement('span');
      typeSpan.className = 'datasource-type';
      typeSpan.textContent = dataSource.type;
      info.appendChild(typeSpan);
    }

    // Add project name
    if (dataSource.project?.name) {
      const projectDiv = document.createElement('div');
      projectDiv.className = 'datasource-info-item';
      projectDiv.innerHTML = `<span class="datasource-info-label">Project:</span> ${dataSource.project.name}`;
      info.appendChild(projectDiv);
    }

    // Add owner name
    if (dataSource.owner?.name) {
      const ownerDiv = document.createElement('div');
      ownerDiv.className = 'datasource-info-item';
      ownerDiv.innerHTML = `<span class="datasource-info-label">Owner:</span> ${dataSource.owner.name}`;
      info.appendChild(ownerDiv);
    }

    // Add created date
    if (dataSource.createdAt) {
      const createdDiv = document.createElement('div');
      createdDiv.className = 'datasource-info-item';
      const date = new Date(dataSource.createdAt).toLocaleDateString('ja-JP');
      createdDiv.innerHTML = `<span class="datasource-info-label">Created:</span> ${date}`;
      info.appendChild(createdDiv);
    }

    // Add certification status
    if (dataSource.isCertified) {
      const certDiv = document.createElement('div');
      certDiv.className = 'datasource-info-item';
      certDiv.innerHTML = '<span class="datasource-info-label">✓ Certified</span>';
      info.appendChild(certDiv);
    }

    div.appendChild(name);
    div.appendChild(info);

    return div;
  }

  showStatus(message, type) {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.statusMessage.textContent = '';
        this.statusMessage.className = 'status-message';
      }, 5000);
    }
  }
}

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
  new UIController();
});
