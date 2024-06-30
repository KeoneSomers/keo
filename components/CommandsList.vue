<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },

        command: {
            type: Function,
            required: true,
        },
    },

    data() {
        return {
            selectedIndex: 0,
        };
    },

    watch: {
        items() {
            this.selectedIndex = 0;
        },
    },

    methods: {
        onKeyDown({event}) {
            if (event.key === "ArrowUp") {
                this.upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                this.downHandler();
                return true;
            }

            if (event.key === "Enter") {
                this.enterHandler();
                return true;
            }

            return false;
        },

        upHandler() {
            this.selectedIndex =
                (this.selectedIndex + this.items.length - 1) % this.items.length;
        },

        downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
        },

        enterHandler() {
            this.selectItem(this.selectedIndex);
        },

        selectItem(index) {
            const item = this.items[index];

            if (item) {
                this.command(item);
            }
        },
    },
};
</script>


<template>
    <div class="dropdown-menu overflow-y-auto w-48 border-zinc-200 dark:border-black bg-white dark:bg-black">
        <template v-if="items.length">
            <button
                :class="{ 'hover:bg-zinc-200 dark:hover:bg-zinc-500 bg-zinc-200 dark:bg-zinc-600': index === selectedIndex }"
                class="hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded"
                v-for="(item, index) in items"
                :key="index"
                @click="selectItem(index)"
            >
                {{ item.title }}
            </button>
        </template>
        <div class="item" v-else>No result</div>
    </div>
</template>

<style scoped>
/* Dropdown menu */
.dropdown-menu {
    max-height: 16rem;
    border-radius: 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.4rem;
    position: relative;

    button {
        align-items: center;
        display: flex;
        padding: 2px 4px;
        gap: 0.25rem;
        text-align: left;
        width: 100%;
    }
}
</style>
