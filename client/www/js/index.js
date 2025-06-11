//server base domain url 
const domainUrl = 'http://localhost:5000';  // if local test, pls use this 
//const domainUrl = 'https://aussi-grab-share.onrender.com'; //render url
const emailRegex = /^[^\s@]+@[^\s@]+(\.[^\s@]{2,})+$/;
const phoneRegex = /^04\d{8}$/; //phoneNumber format
const postcodeRegex = /^\d{4}$/; // postcode format

$(document).on("pagecreate", "#loginPage", function() {
		
	// Select the "Login as" buttons
	var $loginAsUserBtn = $("#loginAsUserBtn");
	var $loginAsBusinessBtn = $("#loginAsBusinessBtn");
	var $selectedAccountTypeInput = $("#selectedAccountType");
	var $loginButton = $("#loginButton");

	// Function to handle selection logic
	function selectAccountType(type) {
		if (type === "user") {
			$loginAsUserBtn.addClass("selected");
			$loginAsBusinessBtn.removeClass("selected");
			$selectedAccountTypeInput.val("user");
		} else if (type === "business") {
			$loginAsBusinessBtn.addClass("selected");
			$loginAsUserBtn.removeClass("selected");
			$selectedAccountTypeInput.val("business");
		}
	}

	// Set initial selection (e.g., User is selected by default)
	selectAccountType("user"); // User is pre-selected as per your image

	// Click event for User button
	$loginAsUserBtn.on("click", function(e) {
		e.preventDefault(); // Prevent default link behavior
		selectAccountType("user");
	});

	// Click event for Business button
	$loginAsBusinessBtn.on("click", function(e) {
		e.preventDefault(); // Prevent default link behavior
		selectAccountType("business");
	});
	
	$loginButton.on("click", function (e) {
        e.preventDefault();
		localStorage.clear();
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        const role = $('#selectedAccountType').val().trim();

        if (!email || !password) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Fields',
              text: 'Please fill in all fields including role.'
            });
            return;
        }
		
        fetch(`${domainUrl}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, role })
        })
        .then(res => res.json())
        .then(data => {

            if (data.token) {
                Swal.fire({
                  icon: 'success',
                  title: 'Login successful!',
                  text: `Welcome back, ${email}!`
                });

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", data.role);

                // Redirect based on role
                $("body").pagecontainer("change", "#FoodItemsPage", {
				  transition: "slide",
				  changeHash: false
				});
            } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Login failed',
                  text: data.msg || data.error || 'Invalid credentials.'
                });
            }
			$("#loginForm")[0].reset();
        })
        .catch(err => {
            $.mobile.loading("hide");
            Swal.fire({
              icon: 'error',
              title: 'Network Error',
              text: 'Something went wrong. Please try again.'
            });
            console.error("Login error:", err);
        });
    });

});

$(document).on("pagecreate", "#userSignupPage", function () {
    $("#userSubmitButton").on("click", function (e) {
        e.preventDefault();


        // Collect form data
        const userData = {
            email: $("#userEmail").val(),
            password: $("#userPassword").val(),
            firstname: $("#firstName").val(),
            lastname: $("#lastName").val(),
            phoneNumber: $("#phoneNumber").val(),
            address: $("#address").val(),
            postcode: $("#postcode").val(),
            state: $("#state").val()
        };
		
		 if (!userData.email || !emailRegex.test(userData.email)) {
            Swal.fire('Validation Error', 'Please enter a valid email address.', 'warning').then(() => {
                $("#userEmail").focus();
            });
            return;
        }

        // Password length between 3 and 10
        if (!userData.password || userData.password.length < 3 || userData.password.length > 10) {
            Swal.fire('Validation Error', 'Password length must be between 3 and 10 characters.', 'warning').then(() => {
                $("#userPassword").focus();
            });
            return;
        }

        // Firstname required
        if (!userData.firstname) {
            Swal.fire('Validation Error', 'First name is required.', 'warning').then(() => {
                $("#firstName").focus();
            });
            return;
        }

        // Lastname required
        if (!userData.lastname) {
            Swal.fire('Validation Error', 'Last name is required.', 'warning').then(() => {
                $("#lastName").focus();
            });
            return;
        }

        // Phone number starts with 04 and is exactly 10 digits numeric
        if (!userData.phoneNumber || !phoneRegex.test(userData.phoneNumber)) {
            Swal.fire('Validation Error', 'Phone number must start with 04 and be exactly 10 digits.', 'warning').then(() => {
                $("#phoneNumber").focus();
            });
            return;
        }

        // Address required
        if (!userData.address) {
            Swal.fire('Validation Error', 'Address is required.', 'warning').then(() => {
                $("#address").focus();
            });
            return;
        }

        if (!userData.postcode || !postcodeRegex.test(userData.postcode)) {
            Swal.fire('Validation Error', 'Postcode must be numeric and up to 4 digits.', 'warning').then(() => {
                $("#postcode").focus();
            });
            return;
        }

        // State required
        if (!userData.state) {
            Swal.fire('Validation Error', 'State is required.', 'warning').then(() => {
                $("#state").focus();
            });
            return;
        }

        // Send POST request using fetch
        fetch(`${domainUrl}/api/auth/register/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server returned an error");
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Registration completed successfully!',
              confirmButtonText: 'OK'
            }).then(() => {
                $.mobile.changePage("#loginPage", { transition: "slide" });
            });
            $("#userForm")[0].reset();
        })
        .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Registration failed. Please try again.'
            });
            console.error("Registration error:", error);
        });
    });
});
$(document).on("pagecreate", "#businessSignupPage", function () {
    $("#businessSubmitButton").on("click", function (e) {
        e.preventDefault();    

        const businessData = {
			businessName: $("#businessName").val(),
			email: $("#businessEmail").val(),
			password: $("#businessPassword").val(),
			ownerFirstName: $("#ownerFirstName").val(),
			ownerLastName: $("#ownerLastName").val(),
			businessType: $("#businessType").val(),
			state: $("#businessState").val(),
			address: $("#businessAddress").val(),
			postcode: $("#businessPostcode").val(),
			phoneNumber: $("#businessPhoneNumber").val()
		};
		
		// Validate business name
        if (!businessData.businessName) {
            Swal.fire('Validation Error', 'Business Name is required.', 'warning').then(() => {
                $("#businessName").focus();
            });
            return;
        }

        // Validate email
        if (!businessData.email || !emailRegex.test(businessData.email)) {
            Swal.fire('Validation Error', 'Please enter a valid business email address.', 'warning').then(() => {
                $("#businessEmail").focus();
            });
            return;
        }

        // Validate password length 3-10
        if (!businessData.password || businessData.password.length < 3 || businessData.password.length > 10) {
            Swal.fire('Validation Error', 'Password length must be between 3 and 10 characters.', 'warning').then(() => {
                $("#businessPassword").focus();
            });
            return;
        }

        // Validate owner first name
        if (!businessData.ownerFirstName) {
            Swal.fire('Validation Error', 'Owner first name is required.', 'warning').then(() => {
                $("#ownerFirstName").focus();
            });
            return;
        }

        // Validate owner last name
        if (!businessData.ownerLastName) {
            Swal.fire('Validation Error', 'Owner last name is required.', 'warning').then(() => {
                $("#ownerLastName").focus();
            });
            return;
        }

        // Validate business type selected
        if (!businessData.businessType) {
            Swal.fire('Validation Error', 'Please select a business type.', 'warning').then(() => {
                $("#businessType").focus();
            });
            return;
        }

        // Validate state selected
        if (!businessData.state) {
            Swal.fire('Validation Error', 'Please select your state.', 'warning').then(() => {
                $("#businessState").focus();
            });
            return;
        }

        // Validate business address
        if (!businessData.address) {
            Swal.fire('Validation Error', 'Business address is required.', 'warning').then(() => {
                $("#businessAddress").focus();
            });
            return;
        }

        // Validate postcode (4 digit number)
        if (!businessData.postcode || !postcodeRegex.test(businessData.postcode)) {
            Swal.fire('Validation Error', 'Postcode must be a 4-digit number.', 'warning').then(() => {
                $("#businessPostcode").focus();
            });
            return;
        }

        // Validate phone number (starts with 04, 10 digits)
        if (!businessData.phoneNumber || !phoneRegex.test(businessData.phoneNumber)) {
            Swal.fire('Validation Error', 'Phone number must start with 04 and be exactly 10 digits.', 'warning').then(() => {
                $("#businessPhoneNumber").focus();
            });
            return;
        }

        // Post to backend API
        fetch(`${domainUrl}/api/auth/register/business`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(businessData)
        })
        .then(response => {
            if (!response.ok) throw new Error("Server error");
            return response.json();
        })
        .then(data => {
            Swal.fire('Success', 'Business registration successful!', 'success').then(() => {
                $.mobile.changePage("#loginPage", { transition: "slide" });
            });
            $("#businessForm")[0].reset();
        })
        .catch(err => {
            Swal.fire('Error', 'Registration failed. Please try again.', 'error');
            console.error("Business Registration error:", err);
        });
    });
});

$(document).on("pageshow", "#FoodItemsPage", function() {
	
	$("#AllFoodIteam, #UserPostedFood, #ClaimedFood").hide();
	const role = localStorage.getItem("role"); // 'user' or 'business'
	const curUser = JSON.parse(localStorage.getItem("user")); // Convert back to object
	var flag = false;
	
	changeNavBasedOnRole(role);

    // Handle tab switching
    if (!$("#food-navbar").data("bound")) {
		$("#food-navbar").on("click", "a", function (e) {
			e.preventDefault();

			// Remove active class and add it to the clicked tab
			$("#food-navbar a").removeClass("ui-btn-active");
			$(this).addClass("ui-btn-active");

			const targetTab = $(this).data("tab");
			flag = (targetTab === "UserPostedFood");

			// Hide all tab contents
			$("#PostItems, #AllFoodIteam, #UserPostedFood, #ClaimedFood").hide();

			// Show the selected tab
			$("#" + targetTab).show();
			
			if(targetTab === "ClaimedFood"){
				$("#ClaimedFood").show();
				loadClaimedItems(curUser.id);
			}
			else{
				loadAllFoodItems(flag);	
			}
		});

		$("#food-navbar").data("bound", true); // Prevent double binding
	}

	function changeNavBasedOnRole(role) {
		if (role === "business") {
			// Change the tab text for the business role
			$("a[data-tab='UserPostedFood']").text("Business Posts");

			// Update the empty state content
			$("#user-empty-state .empty-icon").text("🏢");
			$("#claim-empty-state .empty-icon").text("🏢");
			$("#user-empty-state h3").text("No Business Posts Yet");
			$("#user-empty-state p").text("Local businesses will appear here when they share food items.");
		}
	}
	
	function formatDate(dateStr) {
	  const date = new Date(dateStr);
	  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
	}

	function loadAllFoodItems(flag) {
		
	  let container = "";
	  let route = ""
	  if (flag == true){
		container = document.getElementById("user-items-container");
		route = curUser.id;
	  }	else{
		  container = document.getElementById("all-items-container");
		  route = "all";
	  }
	  container.innerHTML = "";

	  fetch(`${domainUrl}/api/fooditem/${route}`,{
		  method: "GET",
		  headers: {
		  "Authorization": `Bearer ${localStorage.getItem("token")}`
		} 
	  })
		.then(response => response.json())
		.then(data => {
		  if (!data || data.length === 0) {
			container.innerHTML = `
			  <div class="empty-state">
				<div class="empty-icon">🏪</div>
				<h3>No Posts Yet</h3>
				<p>Be the first one to appear here when they share food items.</p>
			  </div>
			`;
			return;
		  }

		  data.forEach(item => {
			const posted = formatDate(item.postedAt);
			const expires = formatDate(item.expiryDate);

			const imageHTML = item.imageUrl
			  ? `<img src="${domainUrl}${item.imageUrl}" alt="Food" class="food-image">`
			  : `<div class="food-image">🍱</div>`;

			const tagClass = item.postedBy.role === "business" ? "business-tag" : "user-tag";
			const tagLabel = item.postedBy.role === "business" ? "Business" : "User";
			
			const isPoster = item.postedBy.id === curUser.id;
			const isClaimed = item.claimed;
			const collectedStatus = item.collectStatus;

			let claimButton = "";
			if (!isPoster && !isClaimed && !flag) {
			  claimButton = `<a href="#" class="ui-btn ui-mini ui-btn-inline claim-button" data-id="${item._id}">Claim</a>`;
			}
			else if(!isPoster && !flag){
				claimButton = `<h3 backgroundColor = 'green'>Food Item Already Claimed`
			}else if(flag && isClaimed && collectedStatus === "pending"){
				claimButton = `<a href="#" class="ui-btn ui-mini ui-btn-inline collect-button" data-id="${item._id}">Collect</a>`;
			}
			else if(flag && isClaimed && collectedStatus === "collected"){
				claimButton = `<p class="text-green-700 text-base font-semibold p-2 bg-green-100 rounded-md shadow-sm">
                        This item has been collected
                    </p>`;
			}
			
			const foodItemHTML = `
			  <div class="food-item ${item.postedBy.role}">
				<div class="food-image-container">
				  ${imageHTML}
				</div>
				<div class="food-details">
				  <div class="food-title">${item.name}
					<span class="poster-type ${tagClass}">${tagLabel}</span>
				  </div>
				  <div class="food-description">${item.description || "No description"}</div>
				  <div class="food-meta">
					<span>Location: ${item.location}</span><br>
					<span>Posted: ${posted}</span><br>
					<span>Expires: ${expires}</span>
				  </div>
				  ${claimButton}
				</div>
			  </div>
			`;

			container.insertAdjacentHTML("beforeend", foodItemHTML);
		  });
		})
		.catch(error => {
		  console.error("Error loading food items:", error);
		  container.innerHTML = `
			<div class="empty-state">
			  <div class="empty-icon">❌</div>
			  <h3>Error</h3>
			  <p>Unable to load food items.</p>
			</div>
		  `;
		});
	}
	
	function loadClaimedItems(userId) {
	  const container = document.getElementById("claim-items-container");
	  container.innerHTML = "";

	  fetch(`${domainUrl}/api/claims/claimed-by-id`, {
		method: "GET",
		headers: {
		  "Authorization": `Bearer ${localStorage.getItem("token")}`
		}
	  })
		.then(response => response.json())
		.then(data => {
		  if (!data || data.length === 0) {
			container.innerHTML = `
			  <div class="empty-state">
				<div class="empty-icon">✅</div>
				<h3>No Claims Yet</h3>
				<p>Items you’ve claimed will appear here.</p>
			  </div>
			`;
			return;
		  }

		  data.forEach(item => {
			const posted = formatDate(item.postedAt);
			const expires = formatDate(item.expiryDate);

			const imageHTML = item.imageUrl
			  ? `<img src="${domainUrl}${item.imageUrl}" alt="Food" class="food-image">`
			  : `<div class="food-image">🍱</div>`;

			const foodItemHTML = `
			  <div class="food-item claimed">
				<div class="food-image-container">${imageHTML}</div>
				<div class="food-details">
				  <div class="food-title">${item.name}</div>
				  <div class="food-description">${item.description || "No description"}</div>
				  <div class="food-meta">
					<span>Location: ${item.location}</span><br>
					<span>Posted: ${posted}</span><br>
					<span>Expires: ${expires}</span>
				  </div>
				  <div class="food-actions">
					${
					  item.claimedBy?.id === curUser.id && item.collectStatus === "pending"
						? `<button class="cancel-claim-btn" data-id="${item._id}">Cancel Claim</button>`
						: `
                    <p class="text-green-700 text-base font-semibold p-2 bg-green-100 rounded-md shadow-sm">
                        This item has been collected
                    </p>
                  `
					}
				  </div>
				</div>
			  </div>
			`;
			container.insertAdjacentHTML("beforeend", foodItemHTML);
		  });
		})
		.catch(error => {
		  console.error("Error loading claimed items:", error);
		});
	}
		

	
	$("#post-button").on("click", function (e) {
	  e.preventDefault();

	  const name = $("#food-title").val().trim();
	  const description = $("#food-description").val().trim();
	  const location = $("#food-location").val().trim();
	  const expiryDate = $("#food-expiry").val();
	  const imageUrl = $("#food-image")[0].files[0];

	  if (!name || !description || !location || !expiryDate || !imageUrl) {
		Swal.fire('Validation Error', 'Please fill all fields and select an image.', 'warning');
		return;
	  }

	  const formData = new FormData();
	  formData.append("name", name);
	  formData.append("description", description);
	  formData.append("location", location);
	  formData.append("expiryDate", expiryDate);
	  formData.append("imageUrl", imageUrl);
	  formData.append("postedById", curUser.id);
	  formData.append("postedByRole", role);

	  fetch(`${domainUrl}/api/fooditem/upload`, {
		method: "POST",
		headers: {
		  "Authorization": `Bearer ${localStorage.getItem("token")}`
		},
		body: formData
	  })
		.then(response => {
		  if (!response.ok) throw new Error("Server error");
		  return response.json();
		})
		.then(data => {
		  Swal.fire('Success', 'Food item posted successfully!', 'success');
		  $("#food-form")[0].reset();
		})
		.catch((err) => {
		  console.error("Food posting error:", err);
		  Swal.fire('Error', 'Food posting failed. Please try again.', 'error');
		});
	});
	
	// Back to login page
    $("#LogOutButton").on("click", function (e) {
		console.log("Back button clicked");
        e.preventDefault();
		localStorage.clear();
		$.mobile.changePage("#loginPage", { transition: "slide" });
		window.location.reload(true);
    });
	
	$(document).on("click", ".claim-button", function (e) {
	  e.preventDefault();
	  const foodId = $(this).data("id");

	  fetch(`${domainUrl}/api/claims/${foodId}`, {
		method: "PATCH",
		headers: {
		  "Authorization": `Bearer ${localStorage.getItem("token")}`
		}
	  })
	  .then(res => {
		if (!res.ok) throw new Error("Failed to claim item");
		return res.json();
	  })
	  .then(() => {
		Swal.fire("Success", "You claimed this item!", "success");
		loadAllFoodItems(false); // Refresh list
	  })
	  .catch(err => {
		console.error("Claim error:", err);
		Swal.fire("Error", "Could not claim item", "error");
	  });
	});
	
	$(document).on("click", ".collect-button", function (e) {
		e.preventDefault();
		const foodItemId = $(this).data("id");
		
		 fetch(`${domainUrl}/api/claims/status/${foodItemId}`, {
			method: "PATCH",
			headers: {
			  "Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		  })
			.then(res => res.json())
			.then(data => {
			  Swal.fire("Success", "Food item marked as collected.", "success");
			  loadAllFoodItems(true); 
			})
			.catch(err => {
			  console.error("collect claim error:", err);
			  Swal.fire("Error", "Failed to collect claim.", "error");
			});

	});
	
	$(document).on("click", ".cancel-claim-btn", function (e) {
		e.preventDefault();
		const foodItemId = this.getAttribute("data-id");

		Swal.fire({
		  title: "Cancel Claim?",
		  text: "Are you sure you want to cancel your claim?",
		  icon: "warning",
		  showCancelButton: true,
		  confirmButtonText: "Yes, Cancel",
		  cancelButtonText: "No"
		}).then((result) => {
		  if (result.isConfirmed) {
			cancelClaim(foodItemId);
		  }
		});
	});
	
	function cancelClaim(itemId) {
	  fetch(`${domainUrl}/api/claims/cancel-claim/${itemId}`, {
		method: "DELETE",
		headers: {
		  "Authorization": `Bearer ${localStorage.getItem("token")}`
		}
	  })
		.then(res => res.json())
		.then(data => {
		  Swal.fire("Cancelled", "Claim has been removed.", "success");
		  // Reload list
		  $("#food-navbar a.ui-btn-active").trigger("click");
		})
		.catch(err => {
		  console.error("Cancel claim error:", err);
		  Swal.fire("Error", "Failed to cancel claim.", "error");
		});
	}

	
});
