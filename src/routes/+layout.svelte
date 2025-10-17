<script>
    import '../app.css';
    import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, Drawer, CloseButton, Sidebar, SidebarWrapper, SidebarGroup, SidebarItem } from 'flowbite-svelte';
    import { sineIn } from 'svelte/easing';

    let drawerHidden = true;

    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn
    };
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navbar -->
    <Navbar let:hidden let:toggle fluid>
        <NavBrand href="/">
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                🌍 Landlosen
            </span>
        </NavBrand>

        <div class="flex md:order-2">
            <NavHamburger on:click={() => drawerHidden = false} class="md:hidden" />
        </div>

        <NavUl {hidden} class="order-1">
            <NavLi href="/" active={true}>Hjem</NavLi>
            <NavLi href="/alle-land">Alle land</NavLi>
        </NavUl>
    </Navbar>

    <!-- Drawer Sidebar -->
    <Drawer transitionType="fly" {transitionParams} bind:hidden={drawerHidden} id="sidebar" class="z-50">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
                Meny
            </h5>
            <CloseButton on:click={() => drawerHidden = true} class="dark:text-white" />
        </div>

        <SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800">
            <SidebarGroup>
                <SidebarItem label="Hjem" href="/" on:click={() => drawerHidden = true}>
                    <svelte:fragment slot="icon">
                        <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                        </svg>
                    </svelte:fragment>
                </SidebarItem>

                <SidebarItem label="Alle land" href="/alle-land" on:click={() => drawerHidden = true}>
                    <svelte:fragment slot="icon">
                        <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                        </svg>
                    </svelte:fragment>
                </SidebarItem>
            </SidebarGroup>
        </SidebarWrapper>
    </Drawer>

    <!-- Main Content -->
    <main class="p-4">
        <slot />
    </main>
</div>
