module.exports = {
    // Check if a user have multiple roles
    function(user, roles) {
      let permissionCounter = 0;
      roles.forEach(role => {
        if (user.roles.indexOf(role)) permissionCounter++;
      });
  
      if (permissionCounter == roles.length) return true;
      else return false;
    }
  };
  