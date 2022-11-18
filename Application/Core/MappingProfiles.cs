using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Domain;
using Azure.Core;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>()
                .ForMember(x => x.Start,
                 opt => opt.MapFrom(src => TimeZone.CurrentTimeZone.ToLocalTime(src.Start)))
               .ForMember(x => x.End,
                  opt => opt.MapFrom(src => TimeZone.CurrentTimeZone.ToLocalTime(src.End)))
                .ForMember(x => x.Category, opt => opt.MapFrom<Category>(_ => null))
                .ForMember(x => x.Recurrence, opt => opt.MapFrom<Recurrence>(_ => null))
                .ForMember(x => x.Organization, opt => opt.MapFrom<Domain.Organization>(_ => null));

            CreateMap<Recurrence, Recurrence>()
                 .ForMember(x => x.IntervalStart,
                  opt => opt.MapFrom(src => GetZeroTime(src.IntervalStart)))
                .ForMember(x => x.IntervalEnd,
                  opt => opt.MapFrom(src => GetElevenFiftyNine(src.IntervalEnd)));

        }

        private DateTime GetZeroTime(DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 0, 0, 0);
        }

        private DateTime GetElevenFiftyNine(DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 23, 59, 59);
        }

    }
}
