<div class="auth-right">
    <div class="auth-card">
 
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Log In</button>
        <button class="auth-tab" id="tab-signup" onclick="switchAuthTab('signup')">Sign Up</button>
      </div>
 
      <div id="auth-error"></div>
 
      <!-- LOGIN -->
      <div id="login-panel">
        <form id="login-form" onsubmit="handleLogin(event)">
          <div class="auth-group">
            <label>Email</label>
            <input type="email" id="li-email" placeholder="you@example.com" required />
          </div>
          <div class="auth-group">
            <label>Password</label>
            <input type="password" id="li-pass" placeholder="••••••••" required />
          </div>
          <button type="submit" class="auth-submit" id="login-btn">
            <span class="btn-label">Log In</span>
            <span class="btn-spinner" id="login-spinner"></span>
          </button>
        </form>
        <p class="auth-switch">No account? <a onclick="switchAuthTab('signup')">Sign up</a></p>
      </div>
 
      <!-- SIGNUP -->
      <div id="signup-panel" style="display:none;">
        <form id="signup-form" onsubmit="handleSignup(event)">
          <div class="auth-name-row">
            <div class="auth-group">
              <label>First Name</label>
              <input type="text" id="su-fname" placeholder="Jane" required />
            </div>
            <div class="auth-group">
              <label>Last Name</label>
              <input type="text" id="su-lname" placeholder="Doe" />
            </div>
          </div>
          <div class="auth-group">
            <label>Email</label>
            <input type="email" id="su-email" placeholder="you@example.com" required />
          </div>
          <div class="auth-group">
            <label>Password</label>
            <input type="password" id="su-pass" placeholder="Min. 8 characters" required />
          </div>
          <button type="submit" class="auth-submit" id="signup-btn">
            <span class="btn-label">Create Account</span>
            <span class="btn-spinner" id="signup-spinner"></span>
          </button>
        </form>
        <p class="auth-switch">Have an account? <a onclick="switchAuthTab('login')">Log in</a></p>
      </div>
 
    </div>
  </div>
</div>
