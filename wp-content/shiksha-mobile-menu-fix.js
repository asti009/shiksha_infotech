/*
 * Shiksha Mobile Menu v7
 * Fixed: submenu auto-closing issue
 */
(function() {
	'use strict';
	
	var overlay = null;
	var currentDropdown = null;
	var currentToggle = null;
	var menuOpen = false;
	var isTogglingSubmenu = false; // Flag to prevent menu close during submenu toggle

	// Initialize
	document.addEventListener('DOMContentLoaded', init);
	window.addEventListener('load', function() { setTimeout(init, 300); });

	function init() {
		console.log('SHIKSHA v7: Init');
		
		// Reset body scroll
		unlockBody();
		
		// Create/get overlay
		overlay = document.querySelector('.shiksha-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'shiksha-overlay';
			document.body.appendChild(overlay);
		}
		overlay.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			closeMenu();
		});

		// Setup hamburgers
		var hamburgers = document.querySelectorAll('.elementor-menu-toggle');
		hamburgers.forEach(setupHamburger);
		
		// Stop clicks inside dropdown from closing menu
		document.querySelectorAll('nav.elementor-nav-menu--dropdown').forEach(function(nav) {
			nav.addEventListener('click', function(e) {
				// Only stop propagation for parent items, not actual navigation links
				var target = e.target;
				var parentLi = target.closest('li.menu-item-has-children');
				var isArrow = target.classList.contains('shiksha-arrow');
				var isParentLink = parentLi && target.closest('a') === parentLi.querySelector(':scope > a');
				
				if (isArrow || isParentLink) {
					e.stopPropagation();
				}
			});
		});
	}

	function setupHamburger(btn) {
		// Skip hidden hamburgers - check parent sections
		var section = btn.closest('section');
		if (section) {
			if (section.classList.contains('elementor-hidden-tablet') || 
				section.classList.contains('elementor-hidden-mobile') ||
				section.classList.contains('elementor-hidden-phone')) {
				return;
			}
		}

		// Skip if done
		if (btn.getAttribute('data-shiksha') === 'v7') return;
		btn.setAttribute('data-shiksha', 'v7');

		// Find dropdown - it's the nav element after the toggle
		var dropdown = null;
		var sibling = btn.nextElementSibling;
		while (sibling) {
			if (sibling.tagName === 'NAV' && sibling.classList.contains('elementor-nav-menu--dropdown')) {
				dropdown = sibling;
				break;
			}
			sibling = sibling.nextElementSibling;
		}
		
		if (!dropdown) {
			dropdown = btn.parentElement.querySelector('nav.elementor-nav-menu--dropdown');
		}
		
		if (!dropdown) {
			console.log('SHIKSHA v7: No dropdown found for hamburger');
			return;
		}

		console.log('SHIKSHA v7: Setup hamburger with dropdown');

		// Setup submenus in this dropdown
		setupSubmenus(dropdown);

		// Handle hamburger click - use capture phase
		btn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			
			console.log('SHIKSHA v7: Hamburger clicked, menuOpen=' + menuOpen);
			
			if (menuOpen && currentDropdown === dropdown) {
				closeMenu();
			} else {
				openMenu(btn, dropdown);
			}
		}, true);
	}

	function setupSubmenus(dropdown) {
		// Find all parent menu items with children
		var parents = dropdown.querySelectorAll('li.menu-item-has-children');
		console.log('SHIKSHA v7: Found ' + parents.length + ' parent items in dropdown');

		parents.forEach(function(li) {
			// Skip if already setup
			if (li.getAttribute('data-shiksha-sub') === 'v7') return;
			li.setAttribute('data-shiksha-sub', 'v7');

			var link = li.querySelector(':scope > a');
			var submenu = li.querySelector(':scope > ul');

			if (!submenu) {
				console.log('SHIKSHA v7: No submenu found');
				return;
			}

			// Create toggle arrow if not exists
			if (!li.querySelector('.shiksha-arrow')) {
				var arrow = document.createElement('span');
				arrow.className = 'shiksha-arrow';
				arrow.innerHTML = '▼';
				li.appendChild(arrow);

				// Arrow click handler
				arrow.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					toggleSubmenu(li);
				}, true);
			}

			// Parent link click handler - prevent navigation and toggle submenu
			if (link) {
				// Remove any existing onclick
				link.onclick = null;
				
				link.addEventListener('click', function(e) {
					if (window.innerWidth <= 1024 && menuOpen) {
						e.preventDefault();
						e.stopPropagation();
						e.stopImmediatePropagation();
						console.log('SHIKSHA v7: Parent link clicked, toggling submenu');
						toggleSubmenu(li);
						return false;
					}
				}, true);
			}
		});
	}

	function toggleSubmenu(li) {
		console.log('SHIKSHA v7: Toggle submenu called');
		
		isTogglingSubmenu = true;
		
		var isOpen = li.classList.contains('shiksha-sub-open');
		var arrow = li.querySelector(':scope > .shiksha-arrow');

		// Close siblings first
		var parent = li.parentElement;
		if (parent) {
			var siblings = parent.querySelectorAll(':scope > li.shiksha-sub-open');
			siblings.forEach(function(sib) {
				if (sib !== li) {
					sib.classList.remove('shiksha-sub-open');
					var sibArrow = sib.querySelector(':scope > .shiksha-arrow');
					if (sibArrow) sibArrow.classList.remove('open');
				}
			});
		}

		// Toggle current
		if (isOpen) {
			li.classList.remove('shiksha-sub-open');
			if (arrow) arrow.classList.remove('open');
			console.log('SHIKSHA v7: Submenu closed');
		} else {
			li.classList.add('shiksha-sub-open');
			if (arrow) arrow.classList.add('open');
			console.log('SHIKSHA v7: Submenu opened');
		}
		
		// Reset flag after a short delay
		setTimeout(function() {
			isTogglingSubmenu = false;
		}, 100);
	}

	function openMenu(btn, dropdown) {
		console.log('SHIKSHA v7: Opening menu');
		
		// Close any other open menu first
		if (currentDropdown && currentDropdown !== dropdown) {
			currentDropdown.classList.remove('shiksha-open');
		}
		
		currentToggle = btn;
		currentDropdown = dropdown;
		menuOpen = true;

		btn.classList.add('elementor-active');
		dropdown.classList.add('shiksha-open');
		overlay.classList.add('active');
		lockBody();

		// Add close button if not exists
		if (!dropdown.querySelector('.shiksha-close-btn')) {
			var closeBtn = document.createElement('button');
			closeBtn.className = 'shiksha-close-btn';
			closeBtn.innerHTML = '×';
			closeBtn.setAttribute('aria-label', 'Close menu');
			closeBtn.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				closeMenu();
			}, true);
			dropdown.insertBefore(closeBtn, dropdown.firstChild);
		}

		// Enable tab navigation
		dropdown.querySelectorAll('a').forEach(function(a) {
			a.removeAttribute('tabindex');
		});
		
		console.log('SHIKSHA v7: Menu opened');
	}

	function closeMenu() {
		// Don't close if we're toggling a submenu
		if (isTogglingSubmenu) {
			console.log('SHIKSHA v7: Ignoring close - toggling submenu');
			return;
		}
		
		console.log('SHIKSHA v7: Closing menu');
		
		menuOpen = false;

		if (currentToggle) {
			currentToggle.classList.remove('elementor-active');
		}

		if (currentDropdown) {
			currentDropdown.classList.remove('shiksha-open');
			
			// Close all submenus
			currentDropdown.querySelectorAll('.shiksha-sub-open').forEach(function(li) {
				li.classList.remove('shiksha-sub-open');
			});
			currentDropdown.querySelectorAll('.shiksha-arrow.open').forEach(function(arrow) {
				arrow.classList.remove('open');
			});

			// Restore tabindex
			currentDropdown.querySelectorAll('a').forEach(function(a) {
				a.setAttribute('tabindex', '-1');
			});
		}

		if (overlay) {
			overlay.classList.remove('active');
		}

		unlockBody();

		currentToggle = null;
		currentDropdown = null;
	}

	function lockBody() {
		document.body.classList.add('shiksha-locked');
	}

	function unlockBody() {
		document.body.classList.remove('shiksha-locked');
		document.body.style.overflow = '';
		document.body.style.position = '';
		document.documentElement.style.overflow = '';
	}

	// Keyboard - ESC closes menu
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && menuOpen) {
			closeMenu();
		}
	});

	// Window resize - close menu if going to desktop
	window.addEventListener('resize', function() {
		if (window.innerWidth > 1024 && menuOpen) {
			closeMenu();
		}
	});

})();
