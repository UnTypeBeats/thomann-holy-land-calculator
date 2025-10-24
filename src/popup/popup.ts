/**
 * Popup script - handles settings UI
 */

// Load current settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get('settings');
  const orderMode = settings.settings?.orderMode || 'bulk';

  // Set the radio button to match current setting
  const bulkRadio = document.getElementById('bulkMode') as HTMLInputElement;
  const singleRadio = document.getElementById('singleMode') as HTMLInputElement;

  if (orderMode === 'bulk' && bulkRadio) {
    bulkRadio.checked = true;
  } else if (orderMode === 'single' && singleRadio) {
    singleRadio.checked = true;
  }

  // Listen for changes
  const orderModeRadios = document.querySelectorAll('input[name="orderMode"]');
  orderModeRadios.forEach((radio) => {
    radio.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const newOrderMode = target.value as 'bulk' | 'single';

      // Get current settings
      const currentSettings = await chrome.storage.sync.get('settings');

      // Update orderMode
      await chrome.storage.sync.set({
        settings: {
          ...currentSettings.settings,
          orderMode: newOrderMode,
        },
      });

      console.log(`Order mode changed to: ${newOrderMode}`);

      // Show feedback
      showFeedback(`Switched to ${newOrderMode === 'bulk' ? 'Bulk' : 'Single item'} mode`);
    });
  });
});

function showFeedback(message: string) {
  // Create temporary feedback message
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  // Remove after 2 seconds
  setTimeout(() => {
    feedback.remove();
  }, 2000);
}
