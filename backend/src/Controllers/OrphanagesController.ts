import { Request, Response } from 'express'

import { getRepository } from 'typeorm'
import Orphanage from '../Models/Orphanage'

import orphanageView from '../Views/orphanages_view'
import OrphanagesSchema from '../Validators/OrphanagesSchema'

export default new class OrphanagesController {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage)
    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    })

    return response.json(orphanageView.renderMany(orphanages))
  }

  async show (request: Request, response: Response) {
    const { id } = request.params

    const orphanagesRepository = getRepository(Orphanage)
    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    })

    return response.json(orphanageView.render(orphanage))
  }

  async store (request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = request.body

    const orphanagesRepository = getRepository(Orphanage)

    const requestImages = request.files as Express.Multer.File[]
    const images = requestImages.map(image=> {
      return { path: image.filename }
    })

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    }

    await OrphanagesSchema.validate(data, { abortEarly: false })

    const orphanage = orphanagesRepository.create(data)
    await orphanagesRepository.save(orphanage)

    return response.status(201).json(orphanage)
  }
}
