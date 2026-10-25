/**
 * Pre-exam setup and hardware permission verification screen
 */
export function PermissionScreen({
  onStartTest,
  onOpenHelp,
  cameraReady,
  cameraPermissionBlocked,
  onRequestCamera,
  onOpenSettings,
  onFullscreen,
  captureDirectory,
  captureMessage,
}) {
  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Hi User!</h1>
        <p>Kindly Allow the following Permissions to Start the test:</p>
      </div>

      <div className="card-container">
        {/* Camera Permission Card */}
        <div className="permission-item">
          <div className="permission-icon">↗</div>
          <div className="permission-content">
            <h3>Configure Camera</h3>
            <p>
              Camera snapshots will be saved locally every 4 seconds while the quiz is active.
            </p>
            <div className="action-row">
              <button onClick={onRequestCamera} className="btn btn-dark">
                Get Camera Access
              </button>
              {cameraPermissionBlocked && (
                <button onClick={onOpenSettings} className="btn btn-outline">
                  Open Camera Settings
                </button>
              )}
            </div>
            {cameraReady && <div className="camera-space" />}
          </div>
        </div>

        <div className="divider" />

        {/* Fullscreen Kiosk Card */}
        <div className="permission-item">
          <div className="permission-icon">⛶</div>
          <div className="permission-content">
            <h3>Switch to full screen</h3>
            <p>Kindly close all tabs and switch to full screen.</p>
            <button onClick={onFullscreen} className="btn btn-light-blue">
              Give Full Screen Permissions
            </button>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <button
          onClick={onStartTest}
          className="btn btn-light-blue"
          disabled={!cameraReady}
        >
          Go To Test
        </button>
        <button className="btn btn-outline" onClick={onOpenHelp}>
          Need Help?
        </button>
      </div>

      {captureDirectory && (
        <p className="capture-status">Snapshots folder: {captureDirectory}</p>
      )}
      {captureMessage && <p className="capture-status">{captureMessage}</p>}
    </div>
  );
}

export default PermissionScreen;
