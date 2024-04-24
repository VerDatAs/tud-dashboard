<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
export default {
  props: {
    isExpanded: Boolean
  },
  emits: ['setCurrentView', 'toggleNavigationExpanded'],
  methods: {
    /**
     * Highlight the tab with a given view name as active and emit setting the current view.
     *
     * @param evt
     * @param viewName
     */
    setCurrentView(evt, viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
        document.querySelectorAll('.tab').forEach((tab) => {
          tab.classList.remove('active')
        })
        evt.target.closest('.tab').classList.add('active')
      }
    },
    /**
     * Emit toggling the state of the menu expansion.
     */
    toggleMenu() {
      this.$emit('toggleNavigationExpanded', !this.isExpanded)
    }
  }
}
</script>

<template>
  <aside :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="menu">
      <div class="tab active" @click="setCurrentView($event, 'knowledgeStructure')" title="Wissensstruktur">
        <font-awesome-icon class="icon" icon="sitemap" />
        <span class="text">Wissensstruktur</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'collaborationMonitoring')" title="Kollaborationen">
        <font-awesome-icon class="icon" icon="users" />
        <span class="text">Kollaborationen</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'query')" title="Datenabfrage">
        <font-awesome-icon class="icon" icon="magnifying-glass" />
        <span class="text">Datenabfrage</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'settings')" title="Einstellungen">
        <font-awesome-icon class="icon" icon="gear" />
        <span class="text">Einstellungen</span>
      </div>
    </div>

    <div class="flex"></div>

    <div class="menu-toggle-wrap">
      <div class="menu-toggle" @click="toggleMenu()">
        <font-awesome-icon class="icon" icon="angles-right" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
aside {
  z-index: 6;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: calc(1rem + 32px);
  display: flex;
  flex-direction: column;
  background-color: var(--dark);
  color: var(--light);
  overflow: hidden;
  padding: 1rem;
  transition: 0.2s ease-in-out;

  .flex {
    flex: 1 1 0%;
  }

  .menu-toggle-wrap {
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
    position: relative;
    top: 0;
    transition: 0.2s ease-in-out;

    .menu-toggle {
      transition: 0.2s ease-in-out;

      .icon {
        font-size: 1rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .icon {
          color: var(--primary);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  .tab .text {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .menu {
    margin: 0 -1rem;

    .tab {
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 45px;
      transition: 0.2s ease-in-out;
      padding: 0.5rem 0.9rem;

      .icon {
        width: 20px;
        height: 20px;
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      .text {
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      &:hover {
        background-color: var(--dark-alt);

        .icon,
        .text {
          color: var(--primary);
        }
      }

      &.active {
        background-color: var(--dark-alt);
        border-right: 5px solid var(--primary);

        .icon,
        .text {
          color: var(--primary);
        }
      }
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    .menu-toggle {
      transform: rotate(-180deg);
    }

    .tab .text {
      opacity: 1;
    }

    .tab {
      .icon {
        margin-right: 1rem;
      }
    }
  }
}
</style>
