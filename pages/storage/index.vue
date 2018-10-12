<template>
  <v-card height="100%" flat>
    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      :rows-per-page-items="[25, 100]"
      must-sort
      class="elevation-1"
    >
      <template slot="items" slot-scope="{ item }">
        <td>{{ item.name }}</td>
        <td class="px-0">
          <v-btn
            :to="{ name: 'storage-id', params: { id: item.id } }"
            icon
            small
            nuxt
          ><v-icon small>list_alt</v-icon></v-btn>

          <v-btn
            icon
            small
            @click="editOpen(item)"
          ><v-icon small>edit</v-icon></v-btn>

          <v-btn
            icon
            small
            @click="deleteOpen(item)"
          ><v-icon small>delete</v-icon></v-btn>
        </td>
      </template>
    </v-data-table>

    <v-btn
      color="primary"
      fab
      fixed
      bottom
      right
      @click="newOpen"
    ><v-icon>add</v-icon></v-btn>

    <v-btn fab style="visibility: hidden;" />

    <v-dialog
      v-model="editDialog"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">Кафе</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editValid" lazy-validation>
            <v-text-field
              v-model="editItem.name"
              :rules="[
                v => !!v || 'Назва обов\'язкова',
              ]"
              label="Назва"
              required
            />

            <!-- TODO: location -->
            <v-text-field
              :value="editItem.location.address || 'Точка на карті'"
              label="Місцезнаходження"
              readonly
              @click="showLocationDialog()"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn flat @click="editCancel">
            Скасувати
          </v-btn>
          
          <v-btn color="primary" @click="editSave">
            Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Видалення кафе</span>
        </v-card-title>

        <v-card-text>
          Дійсьно бажаєте видалити кафе "{{ editItem.name }}"
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          
          <v-btn flat @click="deleteDialog = false">
            Скасувати
          </v-btn>

          <v-btn color="red" dark @click="deleteConfirm">
            Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="locationDialog.show"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card style="height: 100%;">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click.native="locationDialog.show = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Вибір точки на карті</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn
              dark
              flat
              @click.native="locationDialog.show = false, updateLocation()"
            >Вибрати</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <location-select-dialog
          :target.sync="locationDialog.target"
          :address.sync="locationDialog.address"
          style="height: 100%;"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { LOCATION_DEFAULT } from '~/common/consts'
import LocationSelectDialog from '~/components/location-select-dialog'

const INITIAL_ITEM = {
  id: null,
  name: '',
  location: LOCATION_DEFAULT,
}

export default {
  components: {
    LocationSelectDialog,
  },

	data: () => ({
    headers: [
      { text: 'Назва', sortable: false, value: 'name' },
      { text: 'Дії', sortable: false, value: 'name' },
    ],

    items: [],
    loading: true,

    totalItems: 0,
    pagination: {},

    editDialog: false,
    deleteDialog: false,
    editItem: { ...INITIAL_ITEM },
    editValid: true,

    locationDialog: {
      show: false,
      target: null,
      address: null,
    },
	}),

  watch: {
    pagination: {
      async handler() {
        await this.updateItems()
      },
      deep: true,
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Кафе')
  },

  methods: {
    async updateItems() {
      this.loading = true

      const { sortBy, descending, page, rowsPerPage } = this.pagination

      try {
        const { data, meta: { totalCount } } = await this.$axios.$get('/storage', {
          params: {
            page,
            perPage: rowsPerPage,
          },
        })

        this.items = data
        this.totalItems = totalCount
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка отримання даних')
      }

      this.loading = false
    },

    newOpen() {
      this.editItem = { ...INITIAL_ITEM }
      this.editDialog = true
    },

    editOpen(item) {
      this.editItem = {
        ...item,
      }
      this.editDialog = true
    },

    deleteOpen(item) {
      this.editItem = {
        ...item,
      }
      this.deleteDialog = true
    },


    editCancel() {
      this.editDialog = false
    },

    async editSave() {
      if (!this.$refs.editForm.validate()) {
        return false
      }

      const request = {
        ...this.editItem,
      }

      try {
        this.$toast.show('Збереження...')

        const result = await this.$axios.$put('/storage', request)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.editDialog = false
        this.$toast.success('Збережено')

        this.updateItems()
      } catch (e) {
        this.$toast.error('Помилка під час збереження')
      }
    },


    async deleteConfirm() {
      const id = this.editItem.id

      try {
        this.$toast.show('Видалення...')

        const result = await this.$axios.$delete('/storage', {
          params: {
            id,
          },
        })
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.deleteDialog = false
        this.$toast.success('Видалено')

        this.updateItems()
      } catch (e) {
        this.$toast.error('Помилка під час видалення')
      }
    },

    showLocationDialog() {
      this.locationDialog.address = this.editItem.location.address
      this.locationDialog.lat = this.editItem.location.latitude
      this.locationDialog.lng = this.editItem.location.longitude

      this.locationDialog.show = true
    },

    updateLocation() {
      this.editItem.location = {
        address: this.locationDialog.address,
        latitude: this.locationDialog.target.lat,
        longitude: this.locationDialog.target.lng,
      }
    },
  },
}
</script>

