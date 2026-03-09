            <div className="text-xs text-slate-400 italic text-center py-2">No nursing orders added yet</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs px-3 py-1.5">
              {consultation ? 'Update' : 'Save'} Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorConsultation
