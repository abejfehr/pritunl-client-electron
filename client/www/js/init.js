var path = require("path")
var request = require("request")
var fs = require("fs")
var constants = require("./constants.js")
var profile = require("./profile.js")
var service = require("./service.js")
var utils = require("./utils.js")
var profileView = require("./profileView.js")

/**
 * The expected command is
 *
 * cli connect {otp-code}
 */
const [, , action, otp] = process.argv

var authPath
if (process.argv.indexOf("--dev") !== -1) {
  authPath = path.join("..", "dev", "auth")
} else {
  if (process.platform === "win32") {
    authPath = path.join("C:\\", "ProgramData", "Pritunl", "auth")
  } else if (process.platform === "darwin") {
    authPath = path.join(
      path.sep,
      "Applications",
      "Pritunl.app",
      "Contents",
      "Resources",
      "auth"
    )
  } else {
    authPath = path.join(path.sep, "var", "run", "pritunl.auth")
  }
}

try {
  global.key = fs.readFileSync(authPath, "utf8")
  constants.key = global.key
} catch (err) {
  global.key = null
  constants.key = null
}

const getGlobal = name => global[name]

constants.key = getGlobal("key")
constants.icon = getGlobal("icon")

const decorateProfile = prfl => {
  var prflConnect = function() {
    prfl.postConnect(true, function(authType, callback) {
      if (!authType) {
        closeMenu($profile)
        return
      }

      var handler
      var username = ""
      var password = ""
      authType = authType.split("_")

      var authHandler = function() {
        if (authType.indexOf("username") !== -1) {
          authType.splice(authType.indexOf("username"), 1)

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }

            var user = $profile.find(".connect-user-input").val()
            if (user) {
              username = user

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-user-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-user")
          setTimeout(function() {
            $profile.find(".connect-user-input").focus()
          }, 150)
        } else if (authType.indexOf("password") !== -1) {
          authType.splice(authType.indexOf("password"), 1)

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }

            var pass = $profile.find(".connect-pass-input").val()
            if (pass) {
              password += pass

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-pass-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-pass")
          setTimeout(function() {
            $profile.find(".connect-pass-input").focus()
          }, 150)
        } else if (authType.indexOf("pin") !== -1) {
          authType.splice(authType.indexOf("pin"), 1)

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }

            var pin = $profile.find(".connect-pin-input").val()
            if (pin) {
              password += pin

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-pin-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-pin")
          setTimeout(function() {
            $profile.find(".connect-pin-input").focus()
          }, 150)
        } else if (authType.indexOf("duo") !== -1) {
          authType.splice(authType.indexOf("duo"), 1)
          authType.splice(authType.indexOf("otp"), 1)

          $profile
            .find(".connect-otp-input")
            .attr("placeholder", "Enter Duo Passcode")

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }

            var otpCode = $profile.find(".connect-otp-input").val()
            if (otpCode) {
              password += otpCode

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-otp-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-otp")
          setTimeout(function() {
            $profile.find(".connect-otp-input").focus()
          }, 150)
        } else if (authType.indexOf("onelogin") !== -1) {
          authType.splice(authType.indexOf("onelogin"), 1)
          authType.splice(authType.indexOf("otp"), 1)

          $profile
            .find(".connect-otp-input")
            .attr("placeholder", "Enter OneLogin Passcode")

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }

            var otpCode = $profile.find(".connect-otp-input").val()
            if (otpCode) {
              password += otpCode

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-otp-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-otp")
          setTimeout(function() {
            $profile.find(".connect-otp-input").focus()
          }, 150)
        } else if (authType.indexOf("okta") !== -1) {
          authType.splice(authType.indexOf("okta"), 1)
          authType.splice(authType.indexOf("otp"), 1)

          $profile
            .find(".connect-otp-input")
            .attr("placeholder", "Enter Okta Passcode")

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }
            unbindAll($profile)

            var otpCode = $profile.find(".connect-otp-input").val()
            if (otpCode) {
              password += otpCode

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          $profile.find(".menu .connect-confirm").bind("click", handler)
          $profile.find(".connect-otp-input").bind("keypress", handler)
          $profile.find(".menu").addClass("authenticating-otp")
          setTimeout(function() {
            $profile.find(".connect-otp-input").focus()
          }, 150)
        } else if (authType.indexOf("yubikey") !== -1) {
          authType.splice(authType.indexOf("yubikey"), 1)

          handler = function(evt) {
            if (evt.type === "keypress" && evt.which !== 13) {
              return
            }
            unbindAll($profile)

            var otpCode = $profile.find(".connect-yubikey-input").val()
            if (otpCode) {
              password += otpCode

              if (!authType.length) {
                callback(username, password)
                closeMenu($profile)
              } else {
                authHandler()
              }
            } else {
              closeMenu($profile)
            }
          }

          // $profile.find(".menu .connect-confirm").bind("click", handler)
          // $profile.find(".connect-yubikey-input").bind("keypress", handler)
          // $profile.find(".menu").addClass("authenticating-yubikey")
        } else if (authType.indexOf("otp") !== -1) {
          authType.splice(authType.indexOf("otp"), 1)

          var otpCode = otp
          if (otpCode) {
            password += otpCode

            if (!authType.length) {
              callback(username, password)
              // closeMenu($profile)
            } else {
              authHandler()
            }
          }
          // $profile.find(".menu .connect-confirm").bind("click", handler)
          // $profile.find(".connect-otp-input").bind("keypress", handler)
          // $profile.find(".menu").addClass("authenticating-otp")
          // setTimeout(function() {
          //   $profile.find(".connect-otp-input").focus()
          // }, 150)
        } else {
          callback(username, password)
          // closeMenu($profile)
        }
      }
      authHandler()
    })
  }

  return prflConnect
}

profileView.init(profiles => {
  const decoratedProfiles = profiles.map(decorateProfile)

  decoratedProfiles[0]()
})
